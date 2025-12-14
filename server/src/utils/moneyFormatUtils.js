function formatMoney(amount) {
    const numericAmount = Number(amount);

    if (isNaN(numericAmount)) {
        console.error(`Invalid amount provided: ${amount}`);
        return '0 ₫'; 
    }

    return numericAmount.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND'
    });
}

module.exports = {
    formatMoney
}