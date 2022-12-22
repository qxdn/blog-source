---
title: mann-kendall检验
tags:
  - python
categories: python
description: 因为在检验长时间的治疗效果找不到什么很好说明的指标，于是查到了mann kendall检验算法可以检验
date: 2022-12-22 20:18:25
---


# 前言
因为在项目中单次的治疗效果找不到什么指标，用的是模型倒数第二层输出的特征向量和不患病的人之间做特征相似度的分析，但是长期的治疗分析找不到很好的指标，于是想到了使用时间序列的趋势做分析，对于时间序列趋势的检验有mann-kendall算法。

# mann-kendall检验
mann-kendall检验用于判断给定的时间序列是否存在线性单调趋势。
- $H_0$假设：不存在单调趋势
- $H_a$假设：三种
    - 存在单调上升趋势  
    - 存在单调下降趋势
    - 存在单调上升或者单调下降趋势

# mann-kendall的假设
以下假设是mk测试检验的基础
- 在没有趋势的时候，数据成独立同分布
- 随时间推移的观察结果代表真实情况的采样
- 用于采样的方法、仪器测量是无偏差的

# 优点

- 不假设数据是符合特定的分布

- 不受缺省值的影响，受采样值数量的影响

- 不受采样时间间距不规则影响

- 不受时间序列长度影响

# 局限性
- 不适用与具有周期性的数据，为了使数据有效，建建议预处理前删除已知的周期性影响
- 检验对较短的数据给出较多坏结果，序列越长趋势检测越有效

# 计算方法
1. 按照时间顺序列出所有数据$x_1, x_2, ..., x_n
$
2. 计算所有$n(n-1)/2
$种的$x_j-x_k
$的差值其中$j \gt k
$
3. 计算上一步中差值的$sgn$函数结果
$$
sgn(x_i - x_j) =
    \begin{cases}
                    1,  & x_i - x_j > 0\\
                    0,  & x_i - x_j = 0\\
                    -1, & x_i - x_j < 0
    \end{cases}
$$
4. 计算所有$sgn$的和
$$
S = \displaystyle\sum_{k-1}^{n-1}\displaystyle\sum_{j-k+1}^{n}\text{sgn}(x_j-x_k) 
$$
5. 计算方差$VAR(S)$，公式如下。其中g是有相同数据的组的数量，$t_p$是相同数据的数量。例如序列[23, 24, 29, 6, 29, 24, 24, 29, 23]中，我们有g=3个相同数据组，$t_1=2$，因为序列中有2个23，$t_2=3$，因为数据中有3个24，$t_3=3$因为数据中有3个29
$$
\text{VAR}(S) = \frac{1}{18}\Big[n(n-1)(2n+5) 
 - \displaystyle\sum_{p-1}^{g}t_p(t_p-1)(2t_p+5)\Big] 
$$

6. 计算mann kendall检验的统计量
$$
Z_{MK} =
    \begin{cases}
                    \frac{S - 1} {\sqrt{VAR(S)}},  & S > 0\\
                    0,  & S = 0\\
                    \frac{S + 1} {\sqrt{VAR(S)}},  & S < 0\\
    \end{cases}
$$

7. 检验假设：显著性水平$a$（$0<a<0.5$）表示了MK检验中错误的拒绝原假设的可容忍概率
    - $H_0$假设:无趋势
    - 单调上升趋势    
        - $H_a$假设:单调上升趋势
        - 如果$Z_{MK} \geq Z_{1-a}$ 就接受假设 $H_a$，$Z_{1-a}$表示正态分布中第100(1-a)个百分位数
    - 单调下降趋势
        - $H_a$假设:单调下降趋势
        - 如果$Z_{MK} \leq -Z_{1-a} $ 就接受假设 $H_a$
    - 存在单调上升或者单调下降趋势
        - $H_a$假设:存在单调上升或者单调下降趋势
        - 如果$|Z_{MK}| \geq Z_{1-a/2}$ 就接受假设 $H_a$

# 修正公式
因为mk检验中一个重要的步骤就是计算两次测量之间的差异大于、等于还是小于0.如果我们的测量的x精度$\varepsilon = 0.01$，由于存在浮点计算误差可能有$x_{27} - x_{11} = 0.000251 > 0$，这个大于0的值其实是没有意义的，因为在实际的测量中是无法确定这么小的差异，因此在mk检验的实现中我们加入了一个$\varepsilon$来解决
修改上面两个公式
$$
sgn(x_i - x_j) =
    \begin{cases}
                    1,  & x_i - x_j > \varepsilon\\
                    0,  & |x_i - x_j| \leq \varepsilon\\
                    -1, & x_i - x_j < -\varepsilon
    \end{cases}
$$
$$
Z_{MK} =
    \begin{cases}
                    \frac{S - 1} {\sqrt{VAR(S)}},  & S >
                    \varepsilon\\
                    0,  & |S| \leq \varepsilon\\
                    \frac{S + 1} {\sqrt{VAR(S)}},  & S <
                    -\varepsilon\\
    \end{cases}
$$
# 实现代码
```python
import numpy as np
from scipy.stats import norm
from collections import namedtuple

def _preprocess(x):
    """
    数据预处理 返回拉平的x和通道数
    """
    x = np.asarray(x).astype(float)
    dim = x.ndim

    if dim == 1:
        c = 1
    elif dim == 2:
        (_, c) = x.shape

        if c == 1:
            x = x.flatten()
    else:
        assert 1 == dim, "please check you input shape"

    return x, c


def _missing_values_analysis(x, method: str = "skip"):
    """
    缺省值预处理，默认抛弃
    """
    method = method.lower()
    assert method in ["skip"], f"method: {method} is not allow"
    if method == "skip":
        if x.ndim == 1:
            x = x[~np.isnan(x)]
        else:
            x = x[~np.isnan(x).any(axis=1)]

    n = len(x)

    return x, n


def _mk_score(x, n, eps=1e-6):
    """
    计算 mk算法s分数
    """

    sgn = np.zeros((n, n), dtype="int")
    for i in range(n):
        tmp = x - x[i]
        tmp[np.where(np.fabs(tmp) <= eps)] = 0.0  # 对0特殊处理
        sgn[i] = np.sign(tmp)

    s = sgn[np.triu_indices(n, k=1)].sum()  # 取上三角，不含对角线
    return s, sgn


def _variance_s(x, sgn, n,eps=1e-6):
    """
    计算方差
    """
    np.fill_diagonal(sgn,eps*1e6)
    i,_ = np.where(sgn==0.)
    ties = np.unique(x[i]) #重复的点
    p = len(ties)
    q = np.zeros(len(ties), dtype="int")
    for k in range(p):
        idx = np.where(np.fabs(x-ties[k])<eps)
        q[k] = len(idx)

    term1 = n * (n - 1) * (2 * n + 5)
    term2 = (q * (q - 1) * (2 * q + 5)).sum()

    var_s = float(term1 - term2) / 18.
    return var_s

def _z_score(s,var_s,eps=1e-6):
    if s > eps:
        z = (s-1)/np.sqrt(var_s)
    elif np.fabs(s) <= eps:
        z = 0.
    else:
        z = (s+1) / np.sqrt(var_s)
    return z

def _p_value(z,alpha):
    # 双端测试
    p = 2*(1-norm.cdf(abs(z)))  
    h = abs(z) > norm.ppf(1-alpha/2)

    if (z < 0) and h:
        trend = 'decreasing'
    elif (z > 0) and h:
        trend = 'increasing'
    else:
        trend = 'no trend'
    
    return p, h, trend

def mann_kendall_test(x,alpha = 0.05, eps=1e-6):
    '''
    x: 待检验数据
    alpha: 显著性水平 允许错误否定假设的误差 0~0.5
    eps: 最小计数误差
    '''
    res = namedtuple("mann_kendall_result",['trend','h','p'])
    x, _ = _preprocess(x)
    x, n = _missing_values_analysis(x)
    s, sgn = _mk_score(x, n, eps=eps)
    var_s = _variance_s(x,sgn,n,eps=eps)
    z = _z_score(s,var_s,eps=eps)
    p,h,trend = _p_value(z,alpha)
    # 对于mk算法 p不是必须的
    # 可以算斜率，但用不上
    return res(trend,h,p)
```

# 测试效果
```python
x = np.arange(9)
print(mann_kendall_test(x))
x = np.random.sample(60)
print(mann_kendall_test(x)) 
x = np.random.sample(60) - np.arange(60)
print(mann_kendall_test(x))
```
输出如下
```python
mann_kendall_result(trend='increasing', h=True, p=0.00026326080270355767)
mann_kendall_result(trend='no trend', h=False, p=0.754646525401216)
mann_kendall_result(trend='decreasing', h=True, p=0.0)
```

# 参考文献
- [Mann-Kendall Test (mkt)](https://up-rs-esp.github.io/mkt/#module-mkt)
- [Understanding Hypothesis Tests: Significance Levels (Alpha) and P values in Statistics](https://blog.minitab.com/en/adventures-in-statistics-2/understanding-hypothesis-tests-significance-levels-alpha-and-p-values-in-statistics)
- [pyMannKendall](https://github.com/mmhs013/pyMannKendall)
- [Mann-Kendall Test For Monotonic Trend](https://vsp.pnnl.gov/help/vsample/design_trend_mann_kendall.htm)