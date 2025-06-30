"use strict";
const ZALO_PAY_CONFIG = {
    app_id: process.env.ZALOPAY_SANDBOX_APP_ID,
    key1: process.env.ZALOPAY_SANDBOX_KEY1,
    key2: process.env.ZALOPAY_SANDBOX_KEY2,
    endpoint: "https://sandbox.zalopay.com.vn/v001/tpe/createorder",
    callbackUrl: process.env.ZALOPAY_SANDBOX_CALLBACK_URL,
    returnUrl: "https://shop4real.vn/payment/success",
};
