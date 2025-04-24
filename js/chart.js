const SHEET_ID = '1IGNvGmPVLPId6pXY1kQi-c7giSnd1AdAqra4TYM6PHY';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1700953298`;

async function fetchData() {
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        console.log('原始CSV文本:', text);

        const rows = text.split('\n').map(row => row.split(','));
        console.log('分割后的行数据:', rows);
        
        // 移除表头
        rows.shift();
        
        // 解析数据
        const dates = rows.map(row => row[0].replace(/"/g, ''));
        const depositRates = rows.map(row => parseFloat(row[1]));
        const withdrawalRates = rows.map(row => parseFloat(row[2]));
        const merchantCharges = rows.map(row => parseFloat(row[3].replace(/[^\d.]/g, '')));

        renderSuccessRateChart(dates, depositRates, withdrawalRates);
        renderMerchantChargeChart(dates, merchantCharges);
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
            min: 80,
            max: 95,
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
    
    // 计算合适的 Y 轴范围
    const minValue = Math.min(...merchantCharges);
    const maxValue = Math.max(...merchantCharges);
    const valueRange = maxValue - minValue;
    const yMin = Math.floor(minValue - valueRange * 0.1);
    const yMax = Math.ceil(maxValue + valueRange * 0.1);

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
                type: 'line',
                data: merchantCharges,
                itemStyle: {
                    color: '#91CC75'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0,
                            color: '#91CC75'
                        }, {
                            offset: 1,
                            color: 'rgba(145, 204, 117, 0.1)'
                        }]
                    }
                },
                smooth: true,
                showSymbol: true,
                symbolSize: 6,
                label: {
                    show: true,
                    position: 'top',
                    formatter: '${c}',
                    fontSize: 12,
                    color: '#666'
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
    
    if (successRateChart) {
        successRateChart.resize();
    }
    if (merchantChargeChart) {
        merchantChargeChart.resize();
    }
});
