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
        console.log('日期数据:', dates);

        const depositRates = rows.map(row => parseFloat(row[1]));
        console.log('存款率:', depositRates);

        const withdrawalRates = rows.map(row => parseFloat(row[2]));
        console.log('取款率:', withdrawalRates);

        const merchantCharges = rows.map((row, index) => {
            const rawValue = row[3];
            console.log(`第${index + 1}行商户收费原始数据:`, rawValue);
            
            // 移除货币符号、逗号等，但保留数字和小数点
            const cleanValue = rawValue.replace(/[^0-9.]/g, '');
            const value = parseFloat(cleanValue);
            
            // 确保数值有效
            if (isNaN(value)) {
                console.error(`第${index + 1}行商户收费数据无效:`, rawValue);
                return 0;
            }
            
            console.log(`第${index + 1}行商户收费解析后:`, value);
            return value;
        });
        console.log('商户收费数据:', merchantCharges);

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
            min: Math.min(...merchantCharges) * 0.99,
            max: Math.max(...merchantCharges) * 1.01,
            axisLabel: {
                formatter: function(value) {
                    return '$' + value.toFixed(2);
                }
            }
        },
        series: [
            {
                name: '商户收费',
                type: 'line',  // 改为折线图以保持一致的视觉效果
                data: merchantCharges,
                itemStyle: {
                    color: '#91CC75'
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: function(params) {
                        return '$' + params.value.toFixed(2);
                    }
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
