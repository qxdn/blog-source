---
title: python实现依赖注入
tags:
  - python
  - nonebot
categories: python
description: 因为好奇nonebot是如何实现依赖注入的，因此阅读了一下源码，并从中抽取核心代码实现依赖注入
cover: https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.1/cover.jpg
date: 2022-12-15 01:59:00
---


> 封面《彼女は高天に祈らない -quantum girlfriend-》

# 前言
因为在写`nonebot`插件的时候觉得`nonebot`的依赖注入非常的神奇，就读了一下源码，发现其实原理很简单，但是与Java的Spring框架相比还是不太一样，因此就写一下笔记并自己实现一下核心代码。

# nonebot中的依赖注入
在`nonebot2`中我们对于一个插件部分的响应函数一般这样写
```python
@repeat_matcher.handle([Cooldown(2)])
async def repeat_message(bot:Bot,event:GroupMessageEvent):
    ...
```
在运行过程中，`nonebot2`框架在收到消息时会根据事件参数生成`Event`，收到消息的机器人id生成`Bot`参数，然后按照优先级遍历`matcher`执行函数。此时会将`Bot`、`Event`等参数注入到我们自己定义的函数中，除了框架自己定义的依赖以外还有`Depends`函数来包装用户自己定义的依赖。

今天主要讲的是`nonebot2`是怎么实现这个依赖注入了

# nonebot流程
`nonebot2`框架流程如下所示

![流程图](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.1/handle-event.png)

下面以`fastapi`作为驱动器和`onebotV11`作为适配器来具体讲一下具体的依赖注入流程，此处只考虑依赖注入相关内容，不探讨参数校=校验、`Rule`、`Permission`等

初始化的模板首先是执行`nonebot.init()`，这里初始化`driver`，默认的`driver`是`fastapi`，然后给`driver`注册`adapter`。`adapter`中通过`_setup(self)`方法来注册`http`、`websocket`的响应函数。

事件的响应函数流程主要如下,此处省去了一些参数检查、token检查、Bot和Event参数生成、Rule检查、权限检查还有一些前处理后处理的hook函数
> `adapter._handle_ws(self, websocket: WebSocket)` -> `bot.handle_event(event)` -> `message.handle_event(bot,event)` -> `message._check_matcher(priority, matcher, bot, event, stack, dependency_cache)` -> `message._run_matcher(Matcher, bot, event, state, stack, dependency_cache)` -> `matcher.run(bot, event, state, stack, dependency_cache)` -> `matcher.simple_run(bot, event, state, stack, dependency_cache)` -> `Dependent.__call__(matcher,bot,event,state,stack,dependency_cache)`

因此可以看到抛开许多参数的预处理，nonebot解决依赖注入的核心代码在`Dependent`的`__call__`函数中

> 需要注意的是在`message._check_matcher(priority, matcher, bot, event, stack, dependency_cache)`这一步中已经将全部预先定义好的参数传入函数，这里不包含用户定义的Depends，用户定义的Depends要到Dependent.solve时解决


# nonebot依赖注入核心
## 依赖注入容器
`nonebot2`的依赖注入容器是`Dependent`类，先来看其中的核心函数
```python
class Dependent:

    def parse_param(self, name: str, param: inspect.Parameter) -> Param:
        for allow_type in self.allow_types:
            field_info = allow_type._check_param(self, name, param)
            if field_info:
                return field_info
        else:
            raise ValueError(
                f"Unknown parameter {name} for function {self.call} with type {param.annotation}"
            )

    @classmethod
    def parse(
        cls: Type[T],
        *,
        call: Callable[..., Any],
        parameterless: Optional[List[Any]] = None,
        allow_types: Optional[List[Type[Param]]] = None,
    ) -> T:
        signature = get_typed_signature(call)
        params = signature.parameters
        dependent = cls(
            call=call,
            allow_types=allow_types,
        )

        for param_name, param in params.items():
            default_value = Required
            if param.default != param.empty:
                default_value = param.default

            if isinstance(default_value, Param):
                field_info = default_value
                default_value = field_info.default
            else:
                field_info = dependent.parse_param(param_name, param)
                default_value = field_info.default

            annotation: Any = Any
            required = default_value == Required
            if param.annotation != param.empty:
                annotation = param.annotation
            annotation = get_annotation_from_field_info(
                annotation, field_info, param_name
            )
            dependent.params.append(
                ModelField(
                    name=param_name,
                    type_=annotation,
                    class_validators=None,
                    model_config=CustomConfig,
                    default=None if required else default_value,
                    required=required,
                    field_info=field_info,
                )
            )

        parameterless_params = [
            dependent.parse_parameterless(param) for param in (parameterless or [])
        ]
        dependent.parameterless.extend(parameterless_params)

        logger.trace(
            f"Parsed dependent with call={call}, "
            f"params={[param.field_info for param in dependent.params]}, "
            f"parameterless={dependent.parameterless}"
        )

        return dependent

    async def __call__(self, **kwargs: Any) -> R:
            values = await self.solve(**kwargs)

            if is_coroutine_callable(self.call):
                return await self.call(**values)
            else:
                return await run_sync(self.call)(**values)

    async def solve(
            self,
            **params: Any,
        ) -> Dict[str, Any]:
            values: Dict[str, Any] = {}

            for checker in self.pre_checkers:
                await checker._solve(**params)

            for param in self.parameterless:
                await param._solve(**params)

            for field in self.params:
                field_info = field.field_info
                assert isinstance(field_info, Param), "Params must be subclasses of Param"
                value = await field_info._solve(**params)
                if value is Undefined:
                    value = field.get_default()

                try:
                    values[field.name] = check_field_type(field, value)
                except TypeMisMatch:
                    logger.debug(
                        f"{field_info} "
                        f"type {type(value)} not match depends {self.call} "
                        f"annotation {field._type_display()}, ignored"
                    )
                    raise

            return values
```
在运行之前，先对要注入的函数执行`parse`函数，首先通过反射来获取函数的签名和参数。然后生成一个`Dependent`容器。遍历参数，该函数的所有参数包装成`Param`的子类，这里的`Param`是我们依赖注入的最小单元会在后面讲。并且加到`Dependent`容器的`params`里面。

> 函数参数中带的 \* 会使得 \* 后面的参数只能通过指定参数名的形式传

再看`solve`函数,定义了一个字典，key是参数名，value是参数值。该函数通过遍历自己的`params`参数，通过`param`的`_solve`函数来提取对应参数名的参数值。然后将提取到的参数值填充到字典中，这样虽然传进来了许多参数，但是实际执行的注入的参数是函数所拥有的部分。

## 依赖注入核心
上面我们说了`nonebot2`中依赖注入的核心是`Param`类
```python
class Param(abc.ABC, FieldInfo):
    """依赖注入的基本单元 —— 参数。

    继承自 `pydantic.fields.FieldInfo`，用于描述参数信息（不包括参数名）。
    """

    @classmethod
    def _check_param(
        cls, dependent: "Dependent", name: str, param: inspect.Parameter
    ) -> Optional["Param"]:
        return None

    @classmethod
    def _check_parameterless(
        cls, dependent: "Dependent", value: Any
    ) -> Optional["Param"]:
        return None

    @abc.abstractmethod
    async def _solve(self, **kwargs: Any) -> Any:
        raise NotImplementedError

class BotParam(Param):
    """{ref}`nonebot.adapters.Bot` 参数"""

    @classmethod
    def _check_param(
        cls, dependent: Dependent, name: str, param: inspect.Parameter
    ) -> Optional["BotParam"]:
        from nonebot.adapters import Bot

        if param.default == param.empty:
            if generic_check_issubclass(param.annotation, Bot):
                if param.annotation is not Bot:
                    dependent.pre_checkers.append(
                        _BotChecker(
                            Required,
                            field=ModelField(
                                name=name,
                                type_=param.annotation,
                                class_validators=None,
                                model_config=CustomConfig,
                                default=None,
                                required=True,
                            ),
                        )
                    )
                return cls(Required)
            elif param.annotation == param.empty and name == "bot":
                return cls(Required)

    async def _solve(self, bot: "Bot", **kwargs: Any) -> Any:
        return bot

class DependParam(Param):
    """子依赖参数"""

    @classmethod
    def _check_param(
        cls,
        dependent: Dependent,
        name: str,
        param: inspect.Parameter,
    ) -> Optional["DependParam"]:
        if isinstance(param.default, DependsInner):
            dependency: T_Handler
            if param.default.dependency is None:
                assert param.annotation is not param.empty, "Dependency cannot be empty"
                dependency = param.annotation
            else:
                dependency = param.default.dependency
            sub_dependent = Dependent[Any].parse(
                call=dependency,
                allow_types=dependent.allow_types,
            )
            dependent.pre_checkers.extend(sub_dependent.pre_checkers)
            sub_dependent.pre_checkers.clear()
            return cls(
                Required, use_cache=param.default.use_cache, dependent=sub_dependent
            )

    @classmethod
    def _check_parameterless(
        cls, dependent: "Dependent", value: Any
    ) -> Optional["Param"]:
        if isinstance(value, DependsInner):
            assert value.dependency, "Dependency cannot be empty"
            dependent = Dependent[Any].parse(
                call=value.dependency, allow_types=dependent.allow_types
            )
            return cls(Required, use_cache=value.use_cache, dependent=dependent)

    async def _solve(
        self,
        stack: Optional[AsyncExitStack] = None,
        dependency_cache: Optional[T_DependencyCache] = None,
        **kwargs: Any,
    ) -> Any:
        use_cache: bool = self.extra["use_cache"]
        dependency_cache = {} if dependency_cache is None else dependency_cache

        sub_dependent: Dependent = self.extra["dependent"]
        sub_dependent.call = cast(Callable[..., Any], sub_dependent.call)
        call = sub_dependent.call

        # solve sub dependency with current cache
        sub_values = await sub_dependent.solve(
            stack=stack,
            dependency_cache=dependency_cache,
            **kwargs,
        )

        # run dependency function
        task: asyncio.Task[Any]
        if use_cache and call in dependency_cache:
            solved = await dependency_cache[call]
        elif is_gen_callable(call) or is_async_gen_callable(call):
            assert isinstance(
                stack, AsyncExitStack
            ), "Generator dependency should be called in context"
            if is_gen_callable(call):
                cm = run_sync_ctx_manager(contextmanager(call)(**sub_values))
            else:
                cm = asynccontextmanager(call)(**sub_values)
            task = asyncio.create_task(stack.enter_async_context(cm))
            dependency_cache[call] = task
            solved = await task
        elif is_coroutine_callable(call):
            task = asyncio.create_task(call(**sub_values))
            dependency_cache[call] = task
            solved = await task
        else:
            task = asyncio.create_task(run_sync(call)(**sub_values))
            dependency_cache[call] = task
            solved = await task

        return solved
```

`Param`是一个抽象类，为了方便解释我们放两个具体的实现类，我们主要关注两个函数，`_check_param`和`_solve`，`_check_param`函数将符合`Param`的参数包装成`Param`返回否则返回`None`，比如`BotParam`只处理`Bot`类，`DependParam`只处理`DependInner`，同时`_check_param`不仅可以通过`annotation`注入也可以通过参数名注入。`_solve`函数则是从`**kwargs`中获取对应的值，对于实现已经预定好的`bot`参数因为参数名和参数值都是确定的所以很简单，而`DependParam`因为是用户自己定义的类型包装且需要处理嵌套的子`Dependent`，相对处理起来麻烦。

## 处理流程图
干说有点枯燥，还是来一张流程图吧
![依赖注入流程图](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.1/DI-flow.png)

# 实现依赖注入
提取`nonebot2`中依赖注入的核心代码，去除了一些参数检查、matcher选择和hook，只保留了参数注入部分。

完整代码在[github](https://github.com/qxdn/dependency-injection)

## exception.py
主要为解析过程中会遇到的异常
```python
class TypeMisMatch(Exception):
    '''
    参数类型不匹配
    '''
    pass
```
## model.py
主要为预先定义好的一定会出现的参数类型
```python

class TestObj:
    '''
    预先定义好的模型TestObj
    '''
    def __init__(self,id:int):
        self.id = id


class Person:
    '''
    预先定义好的模型Person
    '''
    def __init__(self,name:str) -> None:
        self.name = name
```
## utils.py
主要为一些工具，检查`override`，获取函数参数，检查是否子类等
```python
import inspect
from typing import TypeVar,Callable,Any,Dict,Union,Type,Tuple,TypeVar
from pydantic.typing import ForwardRef,evaluate_forwardref
from pydantic.fields import ModelField
from typing_extensions import get_args, get_origin
from pydantic.typing import is_union, is_none_type
from dependencies.exception import TypeMisMatch

T_Wrapped = TypeVar("T_Wrapped",bound=Callable)
V = TypeVar("V")

def overrides(InterfaceClass:object)-> Callable[[T_Wrapped],T_Wrapped]:
    '''
    检查一个方法是否为父类的实现
    '''

    def decorator(func:T_Wrapped):
        assert func.__name__ in dir(InterfaceClass),f"Error! method:{func.__name__} not in class:{InterfaceClass}"
        return func
    

    return decorator


def get_typed_signature(call: Callable[..., Any]) -> inspect.Signature:
    """获取可调用对象签名"""
    signature = inspect.signature(call)
    globalns = getattr(call, "__globals__", {})
    typed_params = [
        inspect.Parameter(
            name=param.name,
            kind=param.kind,
            default=param.default,
            annotation=get_typed_annotation(param, globalns),
        )
        for param in signature.parameters.values()
    ]
    typed_signature = inspect.Signature(typed_params)
    return typed_signature


def get_typed_annotation(param: inspect.Parameter, globalns: Dict[str, Any]) -> Any:
    '''
    获得参数的类型注解
    '''
    annotation = param.annotation
    if isinstance(annotation, str):
        annotation = ForwardRef(annotation)
        annotation = evaluate_forwardref(annotation, globalns, globalns)
    return annotation


def generic_check_issubclass(
    cls: Any, class_or_tuple: Union[Type[Any], Tuple[Type[Any], ...]]
) -> bool:
    """检查 cls 是否是 class_or_tuple 中的一个类型子类。

    特别的，如果 cls 是 `typing.Union` 或 `types.UnionType` 类型，
    则会检查其中的类型是否是 class_or_tuple 中的一个类型子类。（None 会被忽略）
    """
    try:
        return issubclass(cls, class_or_tuple)
    except TypeError:
        origin = get_origin(cls)
        if is_union(origin):
            return all(
                is_none_type(type_) or generic_check_issubclass(type_, class_or_tuple)
                for type_ in get_args(cls)
            )
        elif origin:
            return issubclass(origin, class_or_tuple)
        return False

def check_field_type(field: ModelField, value: V) -> V:
    _, errs_ = field.validate(value, {}, loc=())
    if errs_:
        raise TypeMisMatch(field, value)
    return value
```
## params.py
主要为依赖注入组件的定义、容器的定义以及对用户自定义类型的包装
```python
from pydantic.fields import FieldInfo, ModelField, Required, Undefined
from pydantic.schema import get_annotation_from_field_info
from pydantic import BaseConfig
import abc
from typing import (
    TYPE_CHECKING,
    Optional,
    Callable,
    Any,
    List,
    Type,
    Dict,
    cast,
)
from dependencies.utils import (
    get_typed_signature,
    overrides,
    generic_check_issubclass,
    check_field_type,
)
from dependencies.exception import TypeMisMatch
import inspect

if TYPE_CHECKING:
    from dependencies.model import TestObj, Person


class CustomConfig(BaseConfig):
    arbitrary_types_allowed = True


class Param(abc.ABC, FieldInfo):
    """
    依赖注入单元 参数
    继承自 `pydantic.fields.FieldInfo`，用于描述参数信息（不包括参数名）。
    """

    ...

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}({self.default})"

    @classmethod
    def _check_param(
        cls, dependent: "Dependent", name: str, param: inspect.Parameter
    ) -> Optional["Param"]:
        """
        解析出Param
        """
        return None

    @abc.abstractmethod
    def _solve(self, **kwargs: Any) -> Any:
        """
        从**kwargs中提取出Param对应value
        """
        raise NotImplementedError


class TestParam(Param):
    """
    TestObj对应的包装
    """

    @classmethod
    def _check_param(
        cls, dependent: "Dependent", name: str, param: inspect.Parameter
    ) -> Optional["Param"]:
        from dependencies.model import TestObj

        if param.default == param.empty:
            if generic_check_issubclass(param.annotation, TestObj):
                # 可以加子类检查，按照类型注入
                return cls(Required)
            elif param.annotation == param.empty and name == "test":
                # 没有标注但是变量名是test，按照名字注入
                return cls(Required)
        return None

    @overrides(Param)
    def _solve(self, test: "TestObj", **kwargs: Any) -> Any:
        return test


class PersonParam(Param):
    """
    Person对应的包装
    """

    @classmethod
    def _check_param(
        cls, dependent: "Dependent", name: str, param: inspect.Parameter
    ) -> Optional["Param"]:
        from dependencies.model import Person

        if param.default == param.empty:
            if generic_check_issubclass(param.annotation, Person):
                # 可以加子类检查，按照类型注入
                return cls(Required)
            elif param.annotation == param.empty and name == "person":
                # 没有标注但是变量名是person，按照名字注入
                return cls(Required)
        return None

    @overrides(Param)
    def _solve(self, person: "Person", **kwargs: Any) -> Any:
        return person


class DependsInner:
    """
    对用户自定义依赖的包装
    """

    def __init__(self, dependency: Optional[Callable[..., Any]]) -> None:
        self.dependency = dependency


class DependParam(Param):
    """
    子依赖参数
    """

    @classmethod
    def _check_param(
        cls, dependent: "Dependent", name: str, param: inspect.Parameter
    ) -> Optional["Param"]:
        if isinstance(param.default, DependsInner):
            dependency: Callable[..., Any]
            if param.default.dependency is None:
                assert param.annotation is not param.empty, "Dependency cannot be empty"
                dependency = param.annotation
            else:
                dependency = param.default.dependency
            sub_dependent = Dependent.parse(call=dependency)
            return cls(Required, dependent=sub_dependent)
        return None

    @overrides(Param)
    def _solve(self, **kwargs: Any) -> Any:
        # 子依赖
        sub_dependent: Dependent = self.extra["dependent"]
        sub_dependent.call = cast(Callable[..., Any], sub_dependent.call)
        call = sub_dependent.call

        # 解析出嵌套依赖的返回值
        sub_values = sub_dependent.solve(**kwargs)

        # 解析当前的返回值
        solved = call(**sub_values)
        return solved


class Dependent:
    """
    依赖注入容器
    """

    ALL_TYPES: List[Type[Param]] = [TestParam, PersonParam, DependParam]

    def __init__(
        self,
        call: Optional[Callable[..., Any]],
        *,
        params: Optional[List[ModelField]] = None,
    ) -> None:
        self.call = call
        self.params = params or []

    def parse_param(self, name: str, param: inspect.Parameter) -> Param:
        """
        将未知参数转为依赖注入Param
        """
        for types in self.ALL_TYPES:
            field_info = types._check_param(self, name, param)
            if field_info:
                return field_info
        else:
            raise ValueError(
                f"Unknown parameter {name} for function {self.call} with type {param.annotation}"
            )

    @classmethod
    def parse(cls, *, call: Callable[..., Any]) -> "Dependent":
        """
        对Callable解析出容器
        """
        signature = get_typed_signature(call=call)  # 获取函数签名
        params = signature.parameters  # 获取函数参数信息
        dependent = cls(call=call)  # 创建容器

        for param_name, param in params.items():
            default_value = Required
            if param.default != param.empty:
                default_value = param.default

            if isinstance(default_value, Param):
                # param 本身就是FieldInfo
                field_info = default_value
                default_value = field_info.default
            else:
                # 不是 Param 类型的需要打包成Param
                field_info = dependent.parse_param(param_name, param)
                default_value = field_info.default

            annotation: Any = Any
            required = default_value == Required
            if param.annotation != param.empty:
                annotation = param.annotation
            annotation = get_annotation_from_field_info(  # 验证annotation
                annotation, field_info, param_name
            )
            dependent.params.append(  # 将解析出的Param添加到容器的依赖中
                ModelField(
                    name=param_name,
                    type_=annotation,
                    class_validators=None,
                    model_config=CustomConfig,
                    default=None if required else default_value,
                    required=required,
                    field_info=field_info,
                )
            )

        return dependent

    def solve(
        self,
        **params: Any,
    ) -> Dict[str, Any]:
        values: Dict[str, Any] = {}  # 解析出的 name:param_value

        for field in self.params:
            field_info = field.field_info
            assert isinstance(field_info, Param), "Params must be subclasses of Param"
            value = field_info._solve(**params)  # 解析出当前参数对应的值
            if value is Undefined:
                value = field.get_default()

            try:
                values[field.name] = check_field_type(field, value) # 检查类型和值是否对应，并添加到字典中
            except TypeMisMatch:
                print(
                    f"{field_info} "
                    f"type {type(value)} not match depends {self.call} "
                    f"annotation {field._type_display()}, ignored"
                )
                raise

        return values

    def __call__(self, **kwargs: Any) -> Any:
        values = self.solve(**kwargs) # 解析出函数的需要的值 字典形式

        return self.call(**values) # 注入参数计算返回

    def __repr__(self) -> str:
        return f"Dependent {self.__class__.__name__} call={self.call.__name__}"


def Depends(dependency: Optional[Callable[..., Any]] = None) -> Any:  # noqa: N802
    '''
    对用户依赖进行包装
    '''
    return DependsInner(dependency=dependency) 

```


# 测试结果
demo如下，省去了`nonebot`中通过装饰器注册容器，和选择handler运行
```python
from typing import Dict
from dependencies.model import TestObj,Person
from dependencies.params import Depends,Dependent
from colorama import Fore

def provider1(person) -> Dict[str,int]:
    print(Fore.GREEN + "----in provider1-----")
    print(f"person'name :{person.name}")
    print("-------end-------")
    return {"c": 123,"d":999}

def provider2(dep:Dict[str,int]=Depends(provider1)) -> Dict[str,int]:
    print(Fore.RED + "----in provider2-----")
    print(f"in provider 2 dep are:{dep}")
    return_values:Dict[str,int] = {"a": 123,"b":999}
    return_values.update(dep)
    print("-------end-------")
    return return_values

def test_func(test:TestObj,dep : Dict[str,int] = Depends(provider2)):
    '''
    原始函数
    '''
    print(Fore.CYAN + "----in test_func-----")
    print(f"testparam's id:{test.id}")
    print("----print dict-----")
    print(dep)
    print("-------end-------")


def main():
    # 运行前注册
    d = Dependent.parse(call=test_func)
    # 外部参数
    p = Person("test person")
    t = TestObj(6)
    # 省去挑选handler步骤，直接执行原函数
    d(test = t,person=p)


if __name__ == '__main__':
    main()
    
```

运行结果如下
![result](https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.5.1/result.png)

# 后记
简单实现一下`nonebot2`的依赖注入，其实可以发现里面的逻辑非常简单，可以简化为通过反射获取函数的参数信息，然后将初始化一个字典values，key是参数名，value是参数值，然后将外部的全部参数按照参数名或者参数类型放入字典中，最后通过`**kwargs`的形式执行被注入函数。

# 参考
[nonebot2文档](https://v2.nonebot.dev/docs/)

[nonebot2](https://github.com/nonebot/nonebot2)

[Bare asterisk in function arguments?](https://stackoverflow.com/questions/14301967/bare-asterisk-in-function-arguments)

[What is the purpose of a bare asterisk in function arguments?](https://stackoverflow.com/questions/23038767/what-is-the-purpose-of-a-bare-asterisk-in-function-arguments)