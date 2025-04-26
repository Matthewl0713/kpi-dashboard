const SHEET_ID = '1IGNvGmPVLPId6pXY1kQi-c7giSnd1AdAqra4TYM6PHY';
const SHEET1_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1700953298`;
const SHEET2_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=2061498883`;
const SHEET3_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
const SHEET4_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=275391102`;
const SHEET5_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=915907336`;

function renderBankAccountUsageChart(months, usageRates) {
    const chart = echarts.init(document.getElementById('bankAccountUsageChart'));
    
    const option = {
        title: {
            text: '银行账户使用率',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: months,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '使用率 (%)',
            min: 0,
            max: 100
        },
        series: [{
            name: '使用率',
            type: 'line',
            data: usageRates,
            smooth: true,
            lineStyle: {
                width: 3
            },
            itemStyle: {
                color: '#5470c6'
            }
        }]
    };

    chart.setOption(option);
}

function renderBankAccountRentalChart(months, rentalFees) {
    const chart = echarts.init(document.getElementById('bankAccountRentalChart'));
    
    const option = {
        title: {
            text: '银行账户租金',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: months,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '租金 (元)'
        },
        series: [{
            name: '租金',
            type: 'bar',
            data: rentalFees,
            itemStyle: {
                color: '#ee6666'
            }
        }]
    };

    chart.setOption(option);
}

async function fetchData() {
    const loading = document.getElementById('loading');
    try {
        const fetchOptions = {
            mode: 'cors',
            headers: {
                'Content-Type': 'text/csv;charset=UTF-8'
            }
        };

        // 获取第一个 Sheet 的数据
        const response1 = await fetch(SHEET1_URL, fetchOptions);
        if (!response1.ok) throw new Error(`HTTP error! status: ${response1.status}`);
        const text1 = await response1.text();
        const rows1 = text1.split('\n').map(row => row.split(','));
        rows1.shift();
        
        // 获取第二个 Sheet 的数据
        const response2 = await fetch(SHEET2_URL, fetchOptions);
        if (!response2.ok) throw new Error(`HTTP error! status: ${response2.status}`);
        const text2 = await response2.text();
        const rows2 = text2.split('\n').map(row => row.split(','));
        rows2.shift();
        
        // 获取第三个 Sheet 的数据（银行账户使用率和租金）
        const response3 = await fetch(SHEET3_URL, fetchOptions);
        if (!response3.ok) throw new Error(`HTTP error! status: ${response3.status}`);
        const text3 = await response3.text();
        const rows3 = text3.split('\n').map(row => row.split(','));
        rows3.shift();

        // 获取第四个 Sheet 的数据（响应速度）
        const response4 = await fetch(SHEET4_URL, fetchOptions);
        if (!response4.ok) throw new Error(`HTTP error! status: ${response4.status}`);
        const text4 = await response4.text();
        const rows4 = text4.split('\n').map(row => row.split(','));
        rows4.shift();

        // 获取第五个 Sheet 的数据（SIM 卡使用情况）
        const response5 = await fetch(SHEET5_URL, fetchOptions);
        if (!response5.ok) throw new Error(`HTTP error! status: ${response5.status}`);
        const text5 = await response5.text();
        const rows5 = text5.split('\n').map(row => row.split(','));
        rows5.shift();

        console.log('数据获取成功，开始处理数据...');
        
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
        const rentalFees = rows3.map(row => parseInt(row[2]));

        // 解析第四个 Sheet 的数据（响应速度）
        const responseDates = rows4.map(row => row[0].replace(/"/g, ''));
        const responseSpeeds = rows4.map(row => parseFloat(row[1]));

        // 解析第五个 Sheet 的数据（SIM 卡使用情况）
        const simCardDates = rows5.map(row => row[0].replace(/"/g, ''));
        const simCardUsage = rows5.map(row => parseFloat(row[1]));

        console.log('数据处理完成，开始渲染图表...');

        renderSuccessRateChart(dates, depositRates, withdrawalRates);
        renderMerchantChargeChart(dates, merchantCharges);
        renderDepositTimeChart(dates, depositTimes);
        renderWithdrawalTimeChart(dates, withdrawalTimes);
        renderBankAccountUsageChart(months, usageRates);
        renderBankAccountRentalChart(months, rentalFees);
        renderResponseSpeedChart(responseDates, responseSpeeds);
        renderSimCardUsageChart(simCardDates, simCardUsage);

        if (loading) loading.style.display = 'none';
    } catch (error) {
        console.error('数据获取或处理错误:', error);
        if (loading) {
            loading.innerHTML = `<div style="color: red;">
                加载失败: ${error.message}
            </div>`;
        }
    }
}

function renderSimCardUsageChart(dates, usage) {
    const chart = echarts.init(document.getElementById('simCardUsageChart'));
    
    const option = {
        title: {
            text: '每日 SIM 卡使用情况',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].axisValue + '<br/>' +
                       '使用量: ' + params[0].value + ' MB';
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
            name: '使用量 (MB)',
            axisLabel: {
                formatter: '{value} MB'
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
                name: '使用量',
                type: 'line',
                areaStyle: {
                    opacity: 0.3
                },
                data: usage,
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
                                formatter: '平均值: {c} MB',
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
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始获取数据...');
    fetchData().catch(error => {
        console.error('初始化失败:', error);
    });
});

// 监听窗口大小变化，调整图表大小
window.addEventListener('resize', function() {
    const successRateChart = echarts.getInstanceByDom(document.getElementById('successRateChart'));
    const merchantChargeChart = echarts.getInstanceByDom(document.getElementById('merchantChargeChart'));
    const depositTimeChart = echarts.getInstanceByDom(document.getElementById('depositTimeChart'));
    const withdrawalTimeChart = echarts.getInstanceByDom(document.getElementById('withdrawalTimeChart'));
    const bankAccountUsageChart = echarts.getInstanceByDom(document.getElementById('bankAccountUsageChart'));
    const bankAccountRentalChart = echarts.getInstanceByDom(document.getElementById('bankAccountRentalChart'));
    const responseSpeedChart = echarts.getInstanceByDom(document.getElementById('responseSpeedChart'));
    const simCardUsageChart = echarts.getInstanceByDom(document.getElementById('simCardUsageChart'));
    
    if (successRateChart) successRateChart.resize();
    if (merchantChargeChart) merchantChargeChart.resize();
    if (depositTimeChart) depositTimeChart.resize();
    if (withdrawalTimeChart) withdrawalTimeChart.resize();
    if (bankAccountUsageChart) bankAccountUsageChart.resize();
    if (bankAccountRentalChart) bankAccountRentalChart.resize();
    if (responseSpeedChart) responseSpeedChart.resize();
    if (simCardUsageChart) simCardUsageChart.resize();
}); 
