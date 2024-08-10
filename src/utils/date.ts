/**
 * 将 number | string | Date 格式化为 'YYYY-MM-DD HH:mm:ss'
 * @param input 要格式化的值，可以是 number（时间戳），string（日期字符串）或 Date 对象
 * @returns 格式化后的字符串
 * @throws 如果输入不能转换为有效的日期，将抛出错误
 */
function formatDate(input: number | string | Date): string {
  let date: Date

  // 根据输入类型处理不同的情况
  if (typeof input === 'number') {
    date = new Date(input)
  } else if (typeof input === 'string') {
    date = new Date(input)
  } else if (input instanceof Date) {
    date = input
  } else {
    throw new Error('Invalid input type')
  }

  // 检查是否为有效日期
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date')
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}