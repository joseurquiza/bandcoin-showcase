const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY!
const PRINTFUL_API_URL = "https://api.printful.com"

interface PrintfulProduct {
  id: number
  type: string
  type_name: string
  title: string
  brand: string
  model: string
  image: string
  variant_count: number
  is_discontinued: boolean
}

interface PrintfulVariant {
  id: number
  product_id: number
  name: string
  size: string
  color: string
  color_code: string
  image: string
  price: string
  in_stock: boolean
  availability_status: string
}

interface PrintfulOrder {
  id: number
  external_id: string
  status: string
  shipping: string
  created: number
  updated: number
  recipient: {
    name: string
    address1: string
    city: string
    state_code: string
    country_code: string
    zip: string
    email?: string
    phone?: string
  }
  items: Array<{
    id: number
    external_id: string
    variant_id: number
    quantity: number
    price: string
    files: Array<{
      type: string
      url: string
    }>
  }>
}

interface MockupTaskData {
  variant_ids: number[]
  format: "jpg" | "png"
  files: Array<{
    placement: string
    image_url: string
    position?: {
      area_width: number
      area_height: number
      width: number
      height: number
      top: number
      left: number
    }
  }>
  options?: Array<{
    id: string
    value: string | number
  }>
}

interface PrintfulStore {
  id: number
  name: string
  type: string
  website: string
  currency: string
  created: number
}

async function printfulRequest(endpoint: string, options: RequestInit = {}, storeId?: number) {
  console.log("[v0 Printful] Making request to:", `${PRINTFUL_API_URL}${endpoint}`)
  console.log("[v0 Printful] Request options:", JSON.stringify(options, null, 2))

  const headers: Record<string, string> = {
    Authorization: `Bearer ${PRINTFUL_API_KEY}`,
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (storeId) {
    headers["X-PF-Store-Id"] = storeId.toString()
    console.log("[v0 Printful] Using store ID:", storeId)
  }

  const response = await fetch(`${PRINTFUL_API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  console.log("[v0 Printful] Response status:", response.status)
  console.log("[v0 Printful] Response data:", JSON.stringify(data, null, 2))

  if (!response.ok) {
    console.error("[v0 Printful] API Error - Status:", response.status)
    console.error("[v0 Printful] API Error - Data:", JSON.stringify(data, null, 2))
    throw new Error(data.error?.message || `Printful API request failed with status ${response.status}`)
  }

  return data.result
}

export async function getProducts() {
  return printfulRequest("/products") as Promise<PrintfulProduct[]>
}

export async function getProduct(productId: number) {
  return printfulRequest(`/products/${productId}`, {}, false)
}

export async function getProductVariants(productId: number) {
  const data = await printfulRequest(`/products/${productId}`, {}, false)
  return data.variants as PrintfulVariant[]
}

export async function createOrder(
  orderData: {
    recipient: PrintfulOrder["recipient"]
    items: PrintfulOrder["items"]
    external_id?: string
  },
  storeId?: number,
) {
  return printfulRequest(
    "/orders",
    {
      method: "POST",
      body: JSON.stringify(orderData),
    },
    storeId,
  ) as Promise<PrintfulOrder>
}

export async function getOrder(orderId: number | string, storeId?: number) {
  return printfulRequest(`/orders/${orderId}`, {}, storeId) as Promise<PrintfulOrder>
}

export async function getOrders(params?: { status?: string; offset?: number; limit?: number }, storeId?: number) {
  const queryParams = new URLSearchParams()
  if (params?.status) queryParams.append("status", params.status)
  if (params?.offset) queryParams.append("offset", params.offset.toString())
  if (params?.limit) queryParams.append("limit", params.limit.toString())

  const query = queryParams.toString()
  return printfulRequest(`/orders${query ? `?${query}` : ""}`, {}, storeId) as Promise<PrintfulOrder[]>
}

export async function estimateShippingCosts(params: {
  recipient: PrintfulOrder["recipient"]
  items: Array<{ variant_id: number; quantity: number }>
}) {
  return printfulRequest("/shipping/rates", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

export async function uploadFile(fileUrl: string) {
  return printfulRequest("/files", {
    method: "POST",
    body: JSON.stringify({
      url: fileUrl,
      type: "default",
      visible: true,
    }),
  })
}

export async function createMockupTask(productId: number, data: MockupTaskData, storeId?: number) {
  return printfulRequest(
    `/mockup-generator/create-task/${productId}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    storeId,
  )
}

export async function getMockupTask(taskKey: string, storeId?: number) {
  return printfulRequest(`/mockup-generator/task?task_key=${taskKey}`, {}, storeId)
}

export async function getProductTemplates(productId: number, orientation?: string, storeId?: number) {
  const query = orientation ? `?orientation=${orientation}` : ""
  return printfulRequest(`/mockup-generator/templates/${productId}${query}`, {}, storeId)
}

export async function getProductPrintfiles(productId: number, orientation?: string, storeId?: number) {
  const query = orientation ? `?orientation=${orientation}` : ""
  return printfulRequest(`/mockup-generator/printfiles/${productId}${query}`, {}, storeId)
}

export async function getStores() {
  return printfulRequest("/stores") as Promise<PrintfulStore[]>
}

export async function getStoreId(): Promise<number | null> {
  try {
    const stores = await getStores()
    if (stores && stores.length > 0) {
      console.log("[v0 Printful] Found store:", stores[0].name, "ID:", stores[0].id)
      return stores[0].id
    }
    console.log("[v0 Printful] No stores found")
    return null
  } catch (error) {
    console.error("[v0 Printful] Error fetching store ID:", error)
    return null
  }
}
