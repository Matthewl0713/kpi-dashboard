function renderSuccessRateChart(dates, depositRates, withdrawalRates) {
    const chart = echarts.init(document.getElementById('successRateChart'));
    
    const option = {
        title: {
            text: '存取款成功率趋势对比',
            left: 'center',
            top: 10  // 调整标题位置
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].axisValue + '<br/>' +
                       params[0].seriesName + ': ' + params[0].value + '%<br/>' +
                       params[1].seriesName + ': ' + params[1].value + '%';
            }
        },
        legend: {
            data: ['存款成功率', '取款成功率'],
            bottom: 0  // 调整图例位置
        },
        grid: {
            top: 60,      // 调整上边距
            bottom: 60,   // 调整下边距
            left: 50,     // 调整左边距
            right: 30,    // 调整右边距
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                rotate: 45,
                margin: 15  // 调整标签与轴的距离
            }
        },
        yAxis: {
            type: 'value',
            min: 80,
            max: 95,
            interval: 5,
            axisLabel: {
                formatter: '{value}%'
            }
        },
        series: [
            {
                name: '存款成功率',
                type: 'line',
                data: depositRates,
                itemStyle: {
                    color: '#5470C6'
                },
                smooth: true,
                symbol: 'circle',  // 添加数据点标记
                symbolSize: 6      // 设置数据点大小
            },
            {
                name: '取款成功率',
                type: 'line',
                data: withdrawalRates,
                itemStyle: {
                    color: '#91CC75'
                },
                smooth: true,
                symbol: 'circle',  // 添加数据点标记
                symbolSize: 6      // 设置数据点大小
            }
        ]
    };

    chart.setOption(option);
}

function renderMerchantChargeChart(dates, merchantCharges) {
    const chart = echarts.init(document.getElementById('merchantChargeChart'));
    
    const option = {
        title: {
            text: '每日商户收费',
            left: 'center',
            top: 10  // 调整标题位置
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].axisValue + '<br/>' +
                       '商户收费: $' + params[0].value.toFixed(2);
            }
        },
        grid: {
            top: 60,      // 调整上边距
            bottom: 60,   // 调整下边距
            left: 50,     // 调整左边距
            right: 30,    // 调整右边距
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                rotate: 45,
                margin: 15  // 调整标签与轴的距离
            }
        },
        yAxis: {
            type: 'value',
            min: 1230,
            max: 1270,
            axisLabel: {
                formatter: '${value}'
            }
        },
        series: [
            {
                name: '商户收费',
                type: 'line',
                data: merchantCharges,
                itemStyle: {
                    color: '#91CC75'
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: '${c}'
                },
                smooth: true,
                symbol: 'circle',  // 添加数据点标记
                symbolSize: 6      // 设置数据点大小
            }
        ]
    };

    chart.setOption(option);
}

// 其他代码保持不变...
