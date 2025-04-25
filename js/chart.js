const SHEET_ID = '1IGNvGmPVLPId6pXY1kQi-c7giSnd1AdAqra4TYM6PHY';
const SHEET1_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1700953298`;
const SHEET2_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=2061498883`;
const SHEET3_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

async function fetchData() {
    try {
        // 获取第一个 Sheet 的数据
        const response1 = await fetch(SHEET1_URL);
        const text1 = await response1.text();
        const rows1 = text1.split('\n').map(row => row.split(','));
        rows1.shift();
        
        // 获取第二个 Sheet 的数据
        const response2 = await fetch(SHEET2_URL);
        const text2 = await response2.text();
        const rows2 = text2.split('\n').map(row => row.split(','));
        rows2.shift();
        
        // 获取第三个 Sheet 的数据（银行账户使用率）
        const response3 = await fetch(SHEET3_URL);
        const text3 = await response3.text();
        const rows3 = text3.split('\n').map(row => row.split(','));
        rows3.shift(); // 移除标题行
        
        // 解析第一个 Sheet 的数据
        const dates = rows1.map(row => row[0].replace(/"/g, ''));
        const depositRates = rows1.map(row => parseFloat(row[1]));
        const withdrawalRates = rows1.map(row => parseFloat(row[2]));
        const merchantCharges = rows1.map(row => parseFloat(row[3].replace(/[^\d.]/g, '')));

        // 解析第二个 Sheet 的数据
        const depositTimes = rows2.map(row => parseFloat(row[1]));
        const withdrawalTimes = rows2.map(row => parseFloat(row[2]));

        // 解析第三个 Sheet 的数据（银行账户使用率）
        const months = rows3.map(row => row[0]);
        const usageRates = rows3.map(row => parseFloat(row[1]));

        renderSuccessRateChart(dates, depositRates, withdrawalRates);
        renderMerchantChargeChart(dates, merchantCharges);
        renderDepositTimeChart(dates, depositTimes);
        renderWithdrawalTimeChart(dates, withdrawalTimes);
        renderBankAccountUsageChart(months, usageRates);
    } catch (error) {
        console.error('数据获取或处理错误:', error);
    }
}

function renderSuccessRateChart(dates, depositRates, withdrawalRates) {
    const chart = echarts.init(document.getElementById('successRateChart'));
    
    const option = {
        title: {
            text: '存取款成功率趋势对比',
            left: 'center'
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
            bottom: 10
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            min: 75,
            max: 100,
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
                smooth: true
            },
            {
                name: '取款成功率',
                type: 'line',
                data: withdrawalRates,
                itemStyle: {
                    color: '#91CC75'
                },
                smooth: true
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
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].axisValue + '<br/>' +
                       '商户收费: $' + params[0].value.toFixed(2);
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            min: 1230,
            max: 1270,
            splitNumber: 8,
            axisLabel: {
                formatter: '${value}'
            }
        },
        series: [
            {
                name: '商户收费',
                type: 'bar',
                data: merchantCharges,
                itemStyle: {
                    color: '#91CC75',
                    borderRadius: [4, 4, 0, 0]
                },
                barWidth: '60%',
                label: {
                    show: false
                }
            }
        ]
    };

    chart.setOption(option);
}

function renderDepositTimeChart(dates, depositTimes) {
    const chart = echarts.init(document.getElementById('depositTimeChart'));
    
    const option = {
        title: {
            text: '每日平均手动存款时间',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].axisValue + '<br/>' +
                       '平均时间: ' + params[0].value + ' 秒';
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 50,
            interval: 5,
            axisLabel: {
                formatter: '{value} 秒'
            },
            splitLine: {
                show: true,
                lineStyle: {
                    type: 'dashed'
                }
            }
        },
        series: [
            {
                name: '存款时间',
                type: 'line',
                data: depositTimes,
                itemStyle: {
                    color: '#5470C6'
                },
                smooth: true,
                markLine: {
                    silent: true,
                    data: [
                        {
                            type: 'average',
                            name: '平均值',
                            label: {
                                formatter: '平均值: {c} 秒',
                                position: 'end'
                            },
                            lineStyle: {
                                type: 'dashed'
                            }
                        }
                    ]
                }
            }
        ]
    };

    chart.setOption(option);
}

function renderWithdrawalTimeChart(dates, withdrawalTimes) {
    const chart = echarts.init(document.getElementById('withdrawalTimeChart'));
    
    const option = {
        title: {
            text: '每日平均手动取款时间',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].axisValue + '<br/>' +
                       '平均时间: ' + params[0].value + ' 秒';
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            min: 50,
            max: 110,
            interval: 5,
            axisLabel: {
                formatter: '{value} 秒'
            },
            splitLine: {
                show: true,
                lineStyle: {
                    type: 'dashed'
                }
            }
        },
        series: [
            {
                name: '取款时间',
                type: 'line',
                data: withdrawalTimes,
                itemStyle: {
                    color: '#5470C6'
                },
                smooth: true,
                markLine: {
                    silent: true,
                    data: [
                        {
                            type: 'average',
                            name: '平均值',
                            label: {
                                formatter: '平均值: {c} 秒',
                                position: 'end'
                            },
                            lineStyle: {
                                type: 'dashed'
                            }
                        }
                    ]
                }
            }
        ]
    };

    chart.setOption(option);
}

function renderBankAccountUsageChart(months, usageRates) {
    const chart = echarts.init(document.getElementById('bankAccountUsageChart'));
    
    // 准备饼图数据
    const data = months.map((month, index) => ({
        value: usageRates[index],
        name: month
    }));

    const option = {
        title: {
            text: '银行账户使用率分布',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            padding: 5
        },
        series: [
            {
                name: '使用率',
                type: 'pie',
                radius: '60%',
                data: data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    formatter: '{b}: {c}'
                }
            }
        ]
    };

    chart.setOption(option);
}

// 页面加载完成后初始化图表
document.addEventListener('DOMContentLoaded', fetchData);

// 监听窗口大小变化，调整图表大小
window.addEventListener('resize', function() {
    const successRateChart = echarts.getInstanceByDom(document.getElementById('successRateChart'));
    const merchantChargeChart = echarts.getInstanceByDom(document.getElementById('merchantChargeChart'));
    const depositTimeChart = echarts.getInstanceByDom(document.getElementById('depositTimeChart'));
    const withdrawalTimeChart = echarts.getInstanceByDom(document.getElementById('withdrawalTimeChart'));
    const bankAccountUsageChart = echarts.getInstanceByDom(document.getElementById('bankAccountUsageChart'));
    
    if (successRateChart) successRateChart.resize();
    if (merchantChargeChart) merchantChargeChart.resize();
    if (depositTimeChart) depositTimeChart.resize();
    if (withdrawalTimeChart) withdrawalTimeChart.resize();
    if (bankAccountUsageChart) bankAccountUsageChart.resize();
});
