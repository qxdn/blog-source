---
title: 使用java反射进行非空检查和转换
tags:
  - java
  - 反射
categories: java
description: >-
  最近在java中有个需要对多个字段进行非空检查，同时还有涉及几个字段的类型转换。想了想还是使用反射来做比较好。之前也只是知道有反射这种做法，如今还是第一次用到
cover: 'https://cdn.jsdelivr.net/gh/qxdn/qxdn-assert@0.4.4/cover.png'
date: 2022-07-26 23:21:35
---


> 封面《喫茶ステラと死神の蝶》

# 问题描述
现在我有一下几个类,需要在`UpdateForm`和`StringModel`之间转换。同时对`StringModel`的部分字段进行一些非空检查。实际的`StringModel`和`UpdateForm`字段较多
```java
@Data
public class BaseModel {
    
    private Integer id;
}
```
```java
@Data
@EqualsAndHashCode(callSuper = true)
public class StringModel extends BaseModel {
    
    private String name;

    private String choice;

    @Override
    public String toString(){
        return "model {id=" + this.getId() +",name="+this.name+",choice="+this.choice + "}";
    }
}
```
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MultiChoiceForm {
    
    private String label;

    private Boolean selected=false;
}
```
```java
@Data
public class UpdateForm {
    
    private Integer id;

    private String name;

    private List<MultiChoiceForm> choice;
}

```

# 通过反射获取属性
在进行一番思考后我决定使用反射来解决这一问题，直接使用`getDeclaredFields()`函数获取类的所有私有成员
```java
public class App 
{
    public static void main( String[] args )
    {
        test1();
    }

    public static void test1(){
        StringModel model = new StringModel();
        model.setId(1);
        model.setName("qxdn");
        model.setChoice("123");
        System.out.printf("model: %s\n",model);
        // 获取public
        //Field[] fields = model.getClass().getFields();
        // 获取所有字段 包含私有
        Field[] fields = model.getClass().getDeclaredFields();
        for(Field field:fields){
            try {
                System.out.printf("field name:%s,filed value:%s\n",field.getName(),field.get(model));
            } catch (IllegalArgumentException | IllegalAccessException e) {
                e.printStackTrace();
            }
        }
        System.out.printf("model: %s\n",model);
    }
}
```
直接执行的结果是Exception
```
java.lang.IllegalAccessException: class com.qxdn.App cannot access a member of class com.qxdn.model.StringModel with modifiers "private"
```
这是说明我们没有权限去访问私有成员,稍微修改一下代码
```java
public static void test1(){
        StringModel model = new StringModel();
        model.setId(1);
        model.setName("qxdn");
        model.setChoice("123");
        System.out.printf("model: %s\n",model);
        // 获取public
        //Field[] fields = model.getClass().getFields();
        // 获取所有字段 包含私有
        Field[] fields = model.getClass().getDeclaredFields();
        for(Field field:fields){
            // 设置访问权限
            field.setAccessible(true);
            try {
                System.out.printf("field name:%s,filed value:%s\n",field.getName(),field.get(model));
            } catch (IllegalArgumentException | IllegalAccessException e) {
                e.printStackTrace();
            }
        }
        System.out.printf("model: %s\n",model);
    }
```
运行结果如下
```
model: model {id=1,name=qxdn,choice=123}
field name:name,filed value:qxdn
field name:choice,filed value:123
model: model {id=1,name=qxdn,choice=123}
```
可以看到这里field没有父类的属性，这是因为`getDeclaredFields()`只会获取当前class的属性，不包含父类，因此我们需要自定义函数获取包含父类属性在内的所有属性。因此添加`getAllFields`函数获取包含父类的所有field
```java
public class App 
{
    public static void main( String[] args )
    {
        test1();
    }

    public static List<Field> getAllFields(Class clazz) {
        if (clazz == null) {
            return Collections.emptyList();
        }

        List<Field> result = new ArrayList<>(getAllFields(clazz.getSuperclass()));
        List<Field> fields = Arrays.stream(clazz.getDeclaredFields())
                .collect(Collectors.toList());
        result.addAll(fields);
        return result;
    }

    public static void test1(){
        StringModel model = new StringModel();
        model.setId(1);
        model.setName("qxdn");
        model.setChoice("123");
        System.out.printf("model: %s\n",model);
        // 获取public
        //Field[] fields = model.getClass().getFields();
        // 获取所有字段 包含私有
        List<Field> fields = getAllFields(model.getClass());
        for(Field field:fields){
            // 设置访问权限
            field.setAccessible(true);
            try {
                System.out.printf("field name:%s,filed value:%s\n",field.getName(),field.get(model));
            } catch (IllegalArgumentException | IllegalAccessException e) {
                e.printStackTrace();
            }
        }
        System.out.printf("model: %s\n",model);
    }
}
```
输出结果
```
model: model {id=1,name=qxdn,choice=123}
field name:id,filed value:1
field name:name,filed value:qxdn
field name:choice,filed value:123
model: model {id=1,name=qxdn,choice=123}
```

# 通过反射检测非空
```java
public static boolean checkNonNull() {
    StringModel model = new StringModel();
    model.setId(1);
    model.setChoice("123");
    System.out.printf("model: %s\n", model);
    List<Field> fields = getAllFields(model.getClass());
    for (Field field : fields) {
        // 设置访问权限
        field.setAccessible(true);
        try {
            if (null == field.get(model)) {
                System.out.printf("field \"%s\" is null\n", field.getName());
                return false;
            }
        } catch (IllegalArgumentException | IllegalAccessException e) {
            e.printStackTrace();
        }
    }
    System.out.printf("model: %s\n", model);
    return true;
}
```
输出
```java
model: model {id=1,name=null,choice=123}
field "name" is null
```

# 反射来进行类型转换
```java
public class InfoUtils {

    private static final String splitText = "┋";

    public static String encodeMultiChoiceForm(List<MultiChoiceForm> list) {
        return  encodeMultiChoiceForm(list,splitText);
    }

    public static String encodeMultiChoiceForm(List<MultiChoiceForm> list,String encoderText){
        StringJoiner joiner = new StringJoiner(encoderText);
        for (MultiChoiceForm form:list){
            if (form.getSelected()){
                joiner.add(form.getLabel());
            }
        }
        return joiner.toString();
    }


    public static List<MultiChoiceForm> decodeMultiChoiceForm(String raw){
        return  decodeMultiChoiceForm(raw,splitText);
    }

    public static List<MultiChoiceForm> decodeMultiChoiceForm(String raw,String decoderText){
        List<MultiChoiceForm> forms = new ArrayList<>();
        String[] strs = raw.split(decoderText);
        for(String str:strs){
            forms.add(new MultiChoiceForm(str,true));
        }
        return  forms;
    }
}
```
```java
public static void convert() {
    StringModel model = new StringModel();
    UpdateForm form = new UpdateForm();
    form.setId(1);
    form.setName("abc");
    List<MultiChoiceForm> list = new ArrayList<>();
    list.add(new MultiChoiceForm("1", true));
    list.add(new MultiChoiceForm("2", false));
    list.add(new MultiChoiceForm("3", true));
    form.setChoice(list);
    String skipName = "id"; // skip id
    System.out.printf("model: %s\n", model);
    System.out.printf("form: %s\n", form);
    List<Field> fields = getAllFields(form.getClass());
    for (Field field : fields) {
        if (field.getName().equals(skipName)){
            continue;
        }
        field.setAccessible(true);
        try {
            if (field.getType().equals(String.class) && !StrUtil.isBlankIfStr(field.get(form))) {
                Field modelField = model.getClass().getDeclaredField(field.getName());
                modelField.setAccessible(true);
                modelField.set(model, field.get(form));
            } else if (null != field.get(form) && !field.getType().equals(String.class)) {
                Field modelField = model.getClass().getDeclaredField(field.getName());
                modelField.setAccessible(true);
                if (field.getType().equals(List.class)) {
                    modelField.set(model, InfoUtils.encodeMultiChoiceForm((List<MultiChoiceForm>) field.get(form)));

                } else {
                    modelField.set(model, field.get(form));
                }
            }
        } catch (IllegalArgumentException | IllegalAccessException | NoSuchFieldException e) {
            e.printStackTrace();
        }
    }
    System.out.printf("model: %s\n", model);
    System.out.printf("form: %s\n", form);
}
```
输出
```
model: model {id=null,name=null,choice=null}
form: UpdateForm(id=1, name=abc, choice=[MultiChoiceForm(label=1, selected=true), MultiChoiceForm(label=2, selected=false), MultiChoiceForm(label=3, selected=true)])
model: model {id=null,name=abc,choice=1┋3}
form: UpdateForm(id=1, name=abc, choice=[MultiChoiceForm(label=1, selected=true), MultiChoiceForm(label=2, selected=false), MultiChoiceForm(label=3, selected=true)])
```

# 后记
本来是只知道java有反射功能，通常用来做框架，倒是不怎么用。这次在类属性多了之后，且要复杂处理的时候才发现反射的好处。