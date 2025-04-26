const SHEET_ID = '1IGNvGmPVLPId6pXY1kQi-c7giSnd1AdAqra4TYM6PHY';
const SHEET1_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1700953298`;
const SHEET2_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=2061498883`;
const SHEET3_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
const SHEET4_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=275391102`;
const SHEET5_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=915907336`; // SIM卡

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

        // 解析第五个 Sheet 的数据（SIM 卡使用情况）【修正】
        const simCardValidRows = rows5.filter(row => row[0] && row[1] && !isNaN(parseFloat(row[1])));
        const simCardDates = simCardValidRows.map(row => row[0].replace(/"/g, ''));
        const simCardUsage = simCardValidRows.map(row => parseFloat(row[1]));

        // 渲染所有图表
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

// 其余渲染函数保持不变...
// ...（此处省略，您原有的 renderXXXChart 函数全部保留）

// 页面加载完成后初始化图表
document.addEventListener('DOMContentLoaded', function() {
    fetchData().catch(error => {
        console.error('初始化失败:', error);
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
        'simCardUsageChart'
    ].forEach(id => {
        const chart = echarts.getInstanceByDom(document.getElementById(id));
        if (chart) chart.resize();
    });
});
