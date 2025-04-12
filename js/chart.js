const SHEET_ID = '1IGNvGmPVLPId6pXY1kQi-c7giSnd1AdAqra4TYM6PHY';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1700953298`;

async function fetchData() {
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const rows = text.split('\n').map(row => row.split(','));
        
        // 移除表头
        rows.shift();
        
        // 解析数据
        const dates = rows.map(row => row[0].replace(/"/g, ''));
        const depositRates = rows.map(row => parseFloat(row[1]));
        const withdrawalRates = rows.map(row => parseFloat(row[2]));
        const merchantCharges = rows.map(row => parseFloat(row[3].replace(/["\$,]/g, '')));
        
        renderSuccessRateChart(dates, depositRates, withdrawalRates);
        renderMerchantChargeChart(dates, merchantCharges);
    } catch (error) {
        console.error('Error fetching data:', error);
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
                       '商户收费: $' + params[0].value;
            }
        },
        grid: {
            left: '3%',
            right: '4
