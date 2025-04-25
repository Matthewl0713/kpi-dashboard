const SHEET_ID = '1IGNvGmPVLPId6pXY1kQi-c7giSnd1AdAqra4TYM6PHY';
const SHEET1_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1700953298`;
const SHEET2_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=2061498883`;
const SHEET3_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
const SHEET4_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=275391102`;

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
        
        // 获取第三个 Sheet 的数据（银行账户使用率和租金）
        const response3 = await fetch(SHEET3_URL);
        const text3 = await response3.text();
        const rows3 = text3.split('\n').map(row => row.split(','));
        rows3.shift(); // 移除标题行

        // 获取第四个 Sheet 的数据（响应速度）
        const response4 = await fetch(SHEET4_URL);
        const text4 = await response4.text();
        const rows4 = text4.split('\n').map(row => row.split(','));
        rows4.shift(); // 移除标题行

        console.log('Sheet 3 原始数据:', rows3);
        console.log('Sheet 4 原始数据:', rows4);
        
        // 解析第一个 Sheet 的数据
        const dates = rows1.map(row => row[0].replace(/"/g, ''));
        const depositRates = rows1.map(row => parseFloat(row[1]));
        const withdrawalRates = rows1.map(row => parseFloat(row[2]));
        const merchantCharges = rows1.map(row => parseFloat(row[3].replace(/[^\d.]/g, '')));

        // 解析第二个 Sheet 的数据
        const depositTimes = rows2.map(row => parseFloat(row[1]));
        const withdrawalTimes = rows2.map(row => parseFloat(row[2]));

        // 解析第三个 Sheet 的数据（银行账户使用率和租金）
        const months = rows3.map(row => row[0].trim());
        const usageRates = rows3.map(row => parseFloat(row[1]));
        const rentalFees = rows3.map(row => parseInt(row[2])); // 直接解析为整数

        // 解析第四个 Sheet 的数据（响应速度）
        const responseDates = rows4.map(row => row[0].replace(/"/g, ''));
        const responseSpeeds = rows4.map(row => parseFloat(row[1]));

        console.log('处理后的数据:', {
            months,
            usageRates,
            rentalFees,
            responseSpeeds
        });

        renderSuccessRateChart(dates, depositRates, withdrawalRates);
        renderMerchantChargeChart(dates, merchantCharges);
        renderDepositTimeChart(dates, depositTimes);
        renderWithdrawalTimeChart(dates, withdrawalTimes);
        renderBankAccountUsageChart(months, usageRates);
        renderBankAccountRentalChart(months, rentalFees);
        renderResponseSpeedChart(responseDates, responseSpeeds);
    } catch (error) {
        console.error('数据获取或处理错误:', error);
    }
}

// ... [保持其他现有的图表函数不变] ...

function renderResponseSpeedChart(dates, speeds) {
    const chart = echarts.init(document.getElementById('responseSpeedChart'));
    
    const option = {
        title: {
            text: '每日平均首次响应速度',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].axisValue + '<br/>' +
                       '响应速度: ' + params[0].value + ' 秒';
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
            boundaryGap: false,
            data: dates,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
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
                name: '响应速度',
                type: 'line',
                areaStyle: {
                    opacity: 0.3
                },
                data: speeds,
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
                            }
                        }
                    ]
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
    const bankAccountRentalChart = echarts.getInstanceByDom(document.getElementById('bankAccountRentalChart'));
    const responseSpeedChart = echarts.getInstanceByDom(document.getElementById('responseSpeedChart'));
    
    if (successRateChart) successRateChart.resize();
    if (merchantChargeChart) merchantChargeChart.resize();
    if (depositTimeChart) depositTimeChart.resize();
    if (withdrawalTimeChart) withdrawalTimeChart.resize();
    if (bankAccountUsageChart) bankAccountUsageChart.resize();
    if (bankAccountRentalChart) bankAccountRentalChart.resize();
    if (responseSpeedChart) responseSpeedChart.resize();
});
