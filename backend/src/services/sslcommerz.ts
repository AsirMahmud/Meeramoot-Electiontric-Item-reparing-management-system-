import { env } from "../config/env.js";

type SslCommerzInitPayload = {
  total_amount: number;
  currency: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url?: string;
  shipping_method: string;
  product_name: string;
  product_category: string;
  product_profile: string;
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_add2?: string;
  cus_city: string;
  cus_state?: string;
  cus_postcode: string;
  cus_country: string;
  cus_phone: string;
  cus_fax?: string;
  ship_name?: string;
  ship_add1?: string;
  ship_add2?: string;
  ship_city?: string;
  ship_state?: string;
  ship_postcode?: string;
  ship_country?: string;
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;
};

type SslCommerzValidatePayload = {
  val_id: string;
};

type SslCommerzRefundInitPayload = {
  refund_amount: number;
  refund_remarks: string;
  bank_tran_id: string;
  refe_id: string;
};

type SslCommerzRefundQueryPayload = {
  refund_ref_id: string;
};

type SslCommerzTransactionBySessionPayload = {
  sessionkey: string;
};

type SslCommerzTransactionByTranIdPayload = {
  tran_id: string;
};

function assertConfigured() {
  if (!env.sslCommerzStoreId || !env.sslCommerzStorePassword) {
    throw new Error(
      "SSLCommerz credentials are not configured. Set SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD.",
    );
  }
}

function baseUrl() {
  return `https://${env.sslCommerzLive ? "securepay" : "sandbox"}.sslcommerz.com`;
}

async function postForm<T extends Record<string, string | number | undefined>>(
  url: string,
  payload: T,
): Promise<unknown> {
  const params = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(payload)) {
    if (rawValue === undefined || rawValue === null) {
      continue;
    }

    params.append(key, String(rawValue));
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  return response.json();
}

async function getJson(
  url: string,
  query: Record<string, string | number | undefined>,
): Promise<unknown> {
  const parsedUrl = new URL(url);

  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue === undefined || rawValue === null) {
      continue;
    }

    parsedUrl.searchParams.set(key, String(rawValue));
  }

  const response = await fetch(parsedUrl.toString(), {
    method: "GET",
  });

  return response.json();
}

export const sslCommerzService = {
  init(data: SslCommerzInitPayload) {
    assertConfigured();

    return postForm(`${baseUrl()}/gwprocess/v4/api.php`, {
      ...data,
      store_id: env.sslCommerzStoreId,
      store_passwd: env.sslCommerzStorePassword,
    });
  },

  validate(data: SslCommerzValidatePayload) {
    assertConfigured();

    return getJson(`${baseUrl()}/validator/api/validationserverAPI.php`, {
      val_id: data.val_id,
      store_id: env.sslCommerzStoreId,
      store_passwd: env.sslCommerzStorePassword,
      v: 1,
      format: "json",
    });
  },

  initiateRefund(data: SslCommerzRefundInitPayload) {
    assertConfigured();

    return getJson(`${baseUrl()}/validator/api/merchantTransIDvalidationAPI.php`, {
      refund_amount: data.refund_amount,
      refund_remarks: data.refund_remarks,
      bank_tran_id: data.bank_tran_id,
      refe_id: data.refe_id,
      store_id: env.sslCommerzStoreId,
      store_passwd: env.sslCommerzStorePassword,
      v: 1,
      format: "json",
    });
  },

  refundQuery(data: SslCommerzRefundQueryPayload) {
    assertConfigured();

    return getJson(`${baseUrl()}/validator/api/merchantTransIDvalidationAPI.php`, {
      refund_ref_id: data.refund_ref_id,
      store_id: env.sslCommerzStoreId,
      store_passwd: env.sslCommerzStorePassword,
      v: 1,
      format: "json",
    });
  },

  transactionQueryBySessionId(data: SslCommerzTransactionBySessionPayload) {
    assertConfigured();

    return getJson(`${baseUrl()}/validator/api/merchantTransIDvalidationAPI.php`, {
      sessionkey: data.sessionkey,
      store_id: env.sslCommerzStoreId,
      store_passwd: env.sslCommerzStorePassword,
      v: 1,
      format: "json",
    });
  },

  transactionQueryByTransactionId(data: SslCommerzTransactionByTranIdPayload) {
    assertConfigured();

    return getJson(`${baseUrl()}/validator/api/merchantTransIDvalidationAPI.php`, {
      tran_id: data.tran_id,
      store_id: env.sslCommerzStoreId,
      store_passwd: env.sslCommerzStorePassword,
      v: 1,
      format: "json",
    });
  },
};
