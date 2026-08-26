/**
 * anime.js 统一导出
 * 锁定 v3 API（anime({...}) 写法）
 * 若误装 v4（import { animate } 写法），代码将不兼容
 */
import anime from "animejs";

/** 导出默认实例，保持 API 一致性 */
export default anime;