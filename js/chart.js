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
            console.log(`第${index + 1}行商户收费原始数据:`, row[3]);
            const value = parseFloat(row[3]);
            console.log(`第${index + 1}行商户收费解析后:`, value);
            return value;
        });
        console.log('商户收费数据:', merchantCharges);
        
        // 检查数据是否有效
        if (merchantCharges.some(isNaN)) {
            console.error('存在无效的商户收费数据');
            console.log('无效数据位置:', merchantCharges.map((v, i) => isNaN(v) ? i : -1).filter(i => i !== -1));
        }

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
            min: 1230,
            max: 1270,
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
