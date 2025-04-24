const SHEET_ID = '1IGNvGmPVLPId6pXY1kQi-c7giSnd1AdAqra4TYM6PHY';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1700953298`;

async function fetchData() {
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const rows = text.split('\n').map(row => row.split(','));
        
        // 添加调试信息
        console.log('原始数据:', rows);
        
        // 移除表头
        rows.shift();
        
        // 解析数据
        const dates = rows.map(row => row[0].replace(/"/g, ''));
        const depositRates = rows.map(row => parseFloat(row[1]));
        const withdrawalRates = rows.map(row => parseFloat(row[2]));
        // 修改商户收费的解析方式
        const merchantCharges = rows.map(row => {
            const value = row[3].replace(/[\$,]/g, '');
            return parseFloat(value);
        });
        
        // 添加调试信息
        console.log('处理后的数据:', {
            dates,
            depositRates,
            withdrawalRates,
            merchantCharges
        });
        
        renderSuccessRateChart(dates, depositRates, withdrawalRates);
        renderMerchantChargeChart(dates, merchantCharges);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('successRateChart').innerHTML = '数据加载失败，请刷新重试';
        document.getElementById('merchantChargeChart').innerHTML = '数据加载失败，请刷新重试';
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

    window.addEventListener('resize', function() {
        chart.resize();
    });
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
            min: 1230,  // 设置合适的最小值
            max: 1270,  // 设置合适的最大值
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
                    color: '#91CC75'
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: '${c}'
                }
            }
        ]
    };

    chart.setOption(option);

    window.addEventListener('resize', function() {
        chart.resize();
    });
}

document.addEventListener('DOMContentLoaded', fetchData);
