const SHEET_ID = '1IGNvGmPVLPId6pXY1kQi-c7giSnd1AdAqra4TYM6PHY';
const SHEET1_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1700953298`;
const SHEET2_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=2061498883`;
const SHEET3_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
const SHEET4_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=275391102`;
const SHEET5_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=915907336`; // SIM卡和注册账号

let allData = {};

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

        // 获取第五个 Sheet 的数据（SIM 卡和注册账号）
        const response5 = await fetch(SHEET5_URL, fetchOptions);
        if (!response5.ok) throw new Error(`HTTP error! status: ${response5.status}`);
        const text5 = await response5.text();
        const rows5 = text5.split('\n').map(row => row.split(','));
        rows5.shift();

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

        // 解析第五个 Sheet 的数据（SIM 卡和注册账号）
        const validRows5 = rows5.filter(row => row[0] && row[1] && !isNaN(parseFloat(row[1])) && row[2] && !isNaN(parseFloat(row[2])));
        const simCardDates = validRows5.map(row => row[0].replace(/"/g, ''));
        const simCardUsage = validRows5.map(row => parseFloat(row[1]));
        const registerAccount = validRows5.map(row => parseFloat(row[2]));

        allData = {
            dates, depositRates, withdrawalRates, merchantCharges,
            depositTimes, withdrawalTimes, months, usageRates, rentalFees,
            responseDates, responseSpeeds, simCardDates, simCardUsage, registerAccount
        };

        generateMonthOptions(simCardDates);
        renderAllCharts(allData);

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

function generateMonthOptions(dateArr) {
    const monthSet = new Set(dateArr.map(dateStr => {
        const d = new Date(dateStr);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    }));
    const monthFilter = document.getElementById('monthFilter');
    monthFilter.innerHTML = '<option value="all">全部</option>';
    monthSet.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month.replace('-', '年') + '月';
        monthFilter.appendChild(option);
    });
}

function renderAllCharts(data) {
    renderSuccessRateChart(data.dates, data.depositRates, data.withdrawalRates);
    renderMerchantChargeChart(data.dates, data.merchantCharges);
    renderDepositTimeChart(data.dates, data.depositTimes);
    renderWithdrawalTimeChart(data.dates, data.withdrawalTimes);
    renderBankAccountUsageChart(data.months, data.usageRates);
    renderBankAccountRentalChart(data.months, data.rentalFees);
    renderResponseSpeedChart(data.responseDates, data.responseSpeeds);
    renderSimCardUsageChart(data.simCardDates, data.simCardUsage);
    renderRegisterAccountChart(data.simCardDates, data.registerAccount);
}

function filterAndRenderCharts(month) {
    if (month === 'all') {
        renderAllCharts(allData);
        return;
    }
    const filterByMonth = (datesArr, ...dataArrs) => {
        return datesArr.reduce((acc, date, i) => {
            const d = new Date(date);
            const m = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
            if (m === month) {
                acc[0].push(date);
                dataArrs.forEach((arr, idx) => acc[idx + 1].push(arr[i]));
            }
            return acc;
        }, [[], ...dataArrs.map(() => [])]);
    };

    let [dates, depositRates, withdrawalRates] = filterByMonth(allData.dates, allData.depositRates, allData.withdrawalRates);
    let [_, merchantCharges] = filterByMonth(allData.dates, allData.merchantCharges);
    let [__, depositTimes] = filterByMonth(allData.dates, allData.depositTimes);
    let [___, withdrawalTimes] = filterByMonth(allData.dates, allData.withdrawalTimes);
    let [simCardDates, simCardUsage] = filterByMonth(allData.simCardDates, allData.simCardUsage);
    let [registerDates, registerAccount] = filterByMonth(allData.simCardDates, allData.registerAccount);
    let [responseDates, responseSpeeds] = filterByMonth(allData.responseDates, allData.responseSpeeds);

    renderSuccessRateChart(dates, depositRates, withdrawalRates);
    renderMerchantChargeChart(dates, merchantCharges);
    renderDepositTimeChart(dates, depositTimes);
    renderWithdrawalTimeChart(dates, withdrawalTimes);
    renderBankAccountUsageChart(allData.months, allData.usageRates);
    renderBankAccountRentalChart(allData.months, allData.rentalFees);
    renderResponseSpeedChart(responseDates, responseSpeeds);
    renderSimCardUsageChart(simCardDates, simCardUsage);
    renderRegisterAccountChart(registerDates, registerAccount);
}

document.addEventListener('DOMContentLoaded', function() {
    fetchData().catch(error => {
        console.error('初始化失败:', error);
    });

    document.getElementById('monthFilter').addEventListener('change', function() {
        filterAndRenderCharts(this.value);
    });
});

// 监听窗口大小变化，调整图表大小
window.addEventListener('resize', function() {
    [
        'successRateChart',
        'merchantChargeChart',
        'depositTimeChart',
        'withdrawalTimeChart',
        'bankAccountUsageChart',
        'bankAccountRentalChart',
        'responseSpeedChart',
        'simCardUsageChart',
        'registerAccountChart'
    ].forEach(id => {
        const chart = echarts.getInstanceByDom(document.getElementById(id));
        if (chart) chart.resize();
    });
});
function renderDepositTimeChart(dates, depositTimes) {
    const chart = echarts.init(document.getElementById('depositTimeChart'));
    const option = {
        title: { text: '每日平均手动存款时间', left: 'center' },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].axisValue + '<br/>' +
                       '平均时间: ' + params[0].value + ' 秒';
            }
        },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: { type: 'category', data: dates, axisLabel: { rotate: 45 } },
        yAxis: {
            type: 'value',
            min: 0,
            max: 50,
            interval: 5,
            axisLabel: { formatter: '{value} 秒' },
            splitLine: { show: true, lineStyle: { type: 'dashed' } }
        },
        series: [
            {
                name: '存款时间',
                type: 'line',
                data: depositTimes,
                itemStyle: { color: '#5470C6' },
                smooth: true,
                markLine: {
                    silent: true,
                    data: [
                        {
                            type: 'average',
                            name: '平均值',
                            label: { formatter: '平均值: {c} 秒', position: 'end' },
                            lineStyle: { type: 'dashed' }
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
        title: { text: '每日平均手动取款时间', left: 'center' },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].axisValue + '<br/>' +
                       '平均时间: ' + params[0].value + ' 秒';
            }
        },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: { type: 'category', data: dates, axisLabel: { rotate: 45 } },
        yAxis: {
            type: 'value',
            min: 50,
            max: 110,
            interval: 5,
            axisLabel: { formatter: '{value} 秒' },
            splitLine: { show: true, lineStyle: { type: 'dashed' } }
        },
        series: [
            {
                name: '取款时间',
                type: 'line',
                data: withdrawalTimes,
                itemStyle: { color: '#5470C6' },
                smooth: true,
                markLine: {
                    silent: true,
                    data: [
                        {
                            type: 'average',
                            name: '平均值',
                            label: { formatter: '平均值: {c} 秒', position: 'end' },
                            lineStyle: { type: 'dashed' }
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
    const option = {
        title: { text: '银行账户使用率', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: months, axisLabel: { rotate: 45 } },
        yAxis: { type: 'value', name: '使用率 (%)', min: 0, max: 100 },
        series: [{
            name: '使用率',
            type: 'line',
            data: usageRates,
            smooth: true,
            lineStyle: { width: 3 },
            itemStyle: { color: '#5470c6' }
        }]
    };
    chart.setOption(option);
}

function renderBankAccountRentalChart(months, rentalFees) {
    const chart = echarts.init(document.getElementById('bankAccountRentalChart'));
    const option = {
        title: { text: '银行账户租金', left: 'center' },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].axisValue + '<br/>' +
                       '租金: $' + params[0].value.toLocaleString();
            }
        },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: { type: 'category', data: months, axisLabel: { rotate: 45 } },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: function(value) {
                    return '$' + value.toLocaleString();
                }
            }
        },
        series: [
            {
                name: '租金',
                type: 'bar',
                data: rentalFees,
                itemStyle: { color: '#5470C6', borderRadius: [4, 4, 0, 0] },
                barWidth: '60%',
                label: {
                    show: true,
                    position: 'top',
                    formatter: function(params) {
                        return '$' + params.value.toLocaleString();
                    }
                }
            }
        ]
    };
    chart.setOption(option);
}
function renderResponseSpeedChart(dates, speeds) {
    const chart = echarts.init(document.getElementById('responseSpeedChart'));
    const option = {
        title: { text: '每日平均首次响应速度', left: 'center' },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].axisValue + '<br/>' +
                       '响应速度: ' + params[0].value + ' 秒';
            }
        },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: dates, axisLabel: { rotate: 45 } },
        yAxis: {
            type: 'value',
            axisLabel: { formatter: '{value} 秒' },
            splitLine: { show: true, lineStyle: { type: 'dashed' } }
        },
        series: [
            {
                name: '响应速度',
                type: 'line',
                areaStyle: { opacity: 0.3 },
                data: speeds,
                itemStyle: { color: '#5470C6' },
                smooth: true,
                markLine: {
                    silent: true,
                    data: [
                        {
                            type: 'average',
                            name: '平均值',
                            label: { formatter: '平均值: {c} 秒', position: 'end' }
                        }
                    ]
                }
            }
        ]
    };
    chart.setOption(option);
}

function renderSimCardUsageChart(dates, usage) {
    const chart = echarts.init(document.getElementById('simCardUsageChart'));
    const option = {
        title: { text: '每日 SIM 卡使用量', left: 'center' },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].axisValue + '<br/>使用量: ' + params[0].value;
            }
        },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: dates, axisLabel: { rotate: 45 } },
        yAxis: {
            type: 'value',
            name: '使用量',
            axisLabel: { formatter: '{value}' },
            splitLine: { show: true, lineStyle: { type: 'dashed' } }
        },
        series: [
            {
                name: 'SIM卡使用量',
                type: 'line',
                areaStyle: { opacity: 0.3 },
                data: usage,
                itemStyle: { color: '#5470C6' },
                smooth: true,
                markLine: {
                    silent: true,
                    data: [
                        {
                            type: 'average',
                            name: '平均值',
                            label: { formatter: '平均值: {c}', position: 'end' }
                        }
                    ]
                }
            }
        ]
    };
    chart.setOption(option);
}

function renderRegisterAccountChart(dates, registerAccount) {
    const chart = echarts.init(document.getElementById('registerAccountChart'));
    const option = {
        title: { text: '每日注册账号总数', left: 'center' },
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: dates, axisLabel: { rotate: 45 } },
        yAxis: { type: 'value', name: '注册账号数', axisLabel: { formatter: '{value}' }, splitLine: { show: true, lineStyle: { type: 'dashed' } } },
        series: [{
            name: '注册账号数',
            type: 'line',
            areaStyle: { opacity: 0.3 },
            data: registerAccount,
            itemStyle: { color: '#91CC75' },
            smooth: true,
            markLine: {
                silent: true,
                data: [{ type: 'average', name: '平均值', label: { formatter: '平均值: {c}', position: 'end' } }]
            }
        }]
    };
    chart.setOption(option);
}
