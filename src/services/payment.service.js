const moment = require("moment");
const Payment = require("../models/payment.model");
const sortObject = (obj) => {
    let sorted = {};
    let str = [];
    let key;

    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }

    str.sort();

    for (key = 0; key < str.length; key++) {
        let sortedKey = str[key];
        sorted[sortedKey] = encodeURIComponent(
            obj[decodeURIComponent(sortedKey)]
        ).replace(/%20/g, "+");
    }

    return sorted;
};
class paymentService {
    static createPaymentUrl = async (req, res) => {
        var ipAddr =
            req.headers["x-forwarded-for"] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress;
        var config = require("config");
        var tmnCode = config.get("vnp_TmnCode");
        var secretKey = config.get("vnp_HashSecret");
        var vnpUrl = config.get("vnp_Url");
        var returnUrl = config.get("vnp_ReturnUrl");
        const payment_object = {
            billing_period: req.body.billing_period,
            amount_due: req.body.amount_due,
            status: "pending",
        }
        const newPayment = null;
        try {
            newPayment = Payment.create(payment_object)
        } catch (error) {
            console.log("payment", error)
        }
        var createDate = moment().format("YYYYMMDDHHmmss");
        var newPaymentId = newPayment._id
        var amount = req.body.amount_due
        var bankCode = req.body.bankCode;

        var orderInfo = req.body.order.note || "thanh toán tiền";
        var orderType = req.body.orderType || "topup";
        var locale = req.body.language;
        if (locale === null || locale === "" || locale === undefined) {
            locale = "vn";
        }
        var currCode = "VND";
        var vnp_Params = {};
        vnp_Params["vnp_Version"] = "2.1.0";
        vnp_Params["vnp_Command"] = "pay";
        vnp_Params["vnp_TmnCode"] = tmnCode;
        // vnp_Params['vnp_Merchant'] = ''
        vnp_Params["vnp_Locale"] = locale;
        vnp_Params["vnp_CurrCode"] = currCode;
        vnp_Params["vnp_TxnRef"] = newPaymentId;
        vnp_Params["vnp_OrderInfo"] = orderInfo;
        vnp_Params["vnp_OrderType"] = orderType;
        vnp_Params["vnp_Amount"] = amount;
        vnp_Params["vnp_ReturnUrl"] = returnUrl;
        vnp_Params["vnp_IpAddr"] = ipAddr;
        vnp_Params["vnp_CreateDate"] = createDate;
        if (bankCode !== null && bankCode !== "" && bankCode !== undefined) {
            vnp_Params["vnp_BankCode"] = "";
        }

        vnp_Params = sortObject(vnp_Params);

        var querystring = require("qs");
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
        vnp_Params["vnp_SecureHash"] = signed;
        vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
        res.send(vnpUrl);
    }
    static vnpayIpn = async (req, res, next) => {
        var vnp_Params = req.query;
        var secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        var config = require('config');
        var secretKey = config.get('vnp_HashSecret');
        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");


        if (secureHash === signed) {
            var orderId = vnp_Params['vnp_TxnRef'];
            var rspCode = vnp_Params['vnp_ResponseCode'];
            res.status(200).json({ RspCode: '00', Message: 'success' })
        }
        else {
            res.status(200).json({ RspCode: '97', Message: 'Fail checksum' })
        }
    }

    static vnpayReturn = async (req, res, next) => {
        var vnp_Params = req.query;
        const newPaymentId = req.query.vnp_TxnRef
        var secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        var config = require('config');
        var secretKey = config.get('vnp_HashSecret');

        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        
        if (secureHash === signed) {
            await Payment.findByIdAndUpdate(newPaymentId,{$set:{status:"completed"}},{new:true})
            return res.json({
                status: 'success',
                message: 'Transaction successful',
                responseCode: vnp_Params['vnp_ResponseCode'],
                transactionId: vnp_Params['vnp_TxnRef'], // Mã giao dịch
                amount: vnp_Params['vnp_Amount'], // Số tiền đã thanh toán
                bankCode: vnp_Params['vnp_BankCode'], // Mã ngân hàng
                paymentDate: vnp_Params['vnp_PayDate'], // Thời gian thanh toán
            });
        } else {
            return res.json({
                status: 'error',
                message: 'Transaction failed',
                responseCode: '97' // Lỗi mã băm không khớp
            });
        }
    }
}

module.exports = paymentService