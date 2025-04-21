import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

/**
 * 导出数据到Excel文件
 * @param data 要导出的数据数组
 * @param fileName 文件名（不包含扩展名）
 * @param sheetName 工作表名称
 */
export function exportToExcel(data: any[], fileName: string = 'export', sheetName: string = 'Sheet1'): void {
  try {
    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    
    // 将数据转换为工作表
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // 生成Excel文件并下载
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    
    console.log('Excel导出成功');
  } catch (error) {
    console.error('Excel导出失败:', error);
    throw error;
  }
}

/**
 * 导出HTML元素到PDF文件
 * @param element 要导出的HTML元素或其ID
 * @param fileName 文件名（不包含扩展名）
 * @param options 配置选项
 */
export async function exportToPDF(
  element: HTMLElement | string,
  fileName: string = 'export',
  options: {
    format?: 'a4' | 'a3' | 'letter' | 'legal';
    orientation?: 'portrait' | 'landscape';
    margin?: number;
    scale?: number;
    title?: string;
  } = {}
): Promise<void> {
  try {
    // 默认选项
    const defaultOptions = {
      format: 'a4' as const,
      orientation: 'portrait' as const,
      margin: 10,
      scale: 1,
      title: ''
    };
    
    // 合并选项
    const mergedOptions = { ...defaultOptions, ...options };
    
    // 获取HTML元素
    const targetElement = typeof element === 'string' 
      ? document.getElementById(element) 
      : element;
    
    if (!targetElement) {
      throw new Error('目标元素不存在');
    }
    
    // 使用html2canvas将HTML元素转换为canvas
    const canvas = await html2canvas(targetElement, {
      scale: mergedOptions.scale,
      logging: false,
      useCORS: true
    });
    
    // 创建PDF文档
    const pdf = new jsPDF({
      orientation: mergedOptions.orientation,
      unit: 'mm',
      format: mergedOptions.format
    });
    
    // 获取PDF尺寸
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // 计算内容区域尺寸（考虑边距）
    const contentWidth = pdfWidth - 2 * mergedOptions.margin;
    const contentHeight = pdfHeight - 2 * mergedOptions.margin;
    
    // 计算图像尺寸和位置
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);
    const imgX = mergedOptions.margin + (contentWidth - imgWidth * ratio) / 2;
    const imgY = mergedOptions.margin;
    
    // 添加标题（如果有）
    if (mergedOptions.title) {
      pdf.setFontSize(16);
      pdf.text(mergedOptions.title, pdfWidth / 2, mergedOptions.margin, { align: 'center' });
    }
    
    // 将canvas添加到PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    // 保存PDF文件
    pdf.save(`${fileName}.pdf`);
    
    console.log('PDF导出成功');
  } catch (error) {
    console.error('PDF导出失败:', error);
    throw error;
  }
}

/**
 * 导出表格数据到CSV文件
 * @param data 要导出的数据数组
 * @param fileName 文件名（不包含扩展名）
 * @param headers 表头映射对象，键为数据字段，值为表头显示名称
 */
export function exportToCSV(
  data: any[],
  fileName: string = 'export',
  headers?: Record<string, string>
): void {
  try {
    if (!data || data.length === 0) {
      throw new Error('没有数据可导出');
    }
    
    // 获取所有字段
    const fields = Object.keys(data[0]);
    
    // 生成表头行
    let csvContent = '';
    if (headers) {
      csvContent += fields.map(field => headers[field] || field).join(',') + '\n';
    } else {
      csvContent += fields.join(',') + '\n';
    }
    
    // 生成数据行
    data.forEach(item => {
      const row = fields.map(field => {
        const value = item[field];
        // 处理包含逗号、引号或换行符的值
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        } else {
          return value;
        }
      }).join(',');
      csvContent += row + '\n';
    });
    
    // 创建Blob对象
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    
    // 下载文件
    saveAs(blob, `${fileName}.csv`);
    
    console.log('CSV导出成功');
  } catch (error) {
    console.error('CSV导出失败:', error);
    throw error;
  }
}

/**
 * 导出表格数据到JSON文件
 * @param data 要导出的数据
 * @param fileName 文件名（不包含扩展名）
 */
export function exportToJSON(data: any, fileName: string = 'export'): void {
  try {
    // 将数据转换为JSON字符串
    const jsonString = JSON.stringify(data, null, 2);
    
    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 下载文件
    saveAs(blob, `${fileName}.json`);
    
    console.log('JSON导出成功');
  } catch (error) {
    console.error('JSON导出失败:', error);
    throw error;
  }
}

/**
 * 导出图表为图片
 * @param chart ECharts实例
 * @param fileName 文件名（不包含扩展名）
 * @param type 图片类型，默认为png
 */
export function exportChartToImage(chart: any, fileName: string = 'chart', type: 'png' | 'jpeg' = 'png'): void {
  try {
    // 获取图表的数据URL
    const dataURL = chart.getDataURL({
      type,
      pixelRatio: 2,
      backgroundColor: '#fff'
    });
    
    // 将数据URL转换为Blob
    const binary = atob(dataURL.split(',')[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    const blob = new Blob([new Uint8Array(array)], { type: `image/${type}` });
    
    // 下载文件
    saveAs(blob, `${fileName}.${type}`);
    
    console.log('图表导出成功');
  } catch (error) {
    console.error('图表导出失败:', error);
    throw error;
  }
}

/**
 * 导出简历为PDF
 * @param resumeElement 简历HTML元素或其ID
 * @param fileName 文件名（不包含扩展名）
 * @param userInfo 用户信息，用于设置文件名
 */
export async function exportResumeToPDF(
  resumeElement: HTMLElement | string,
  fileName: string = 'resume',
  userInfo?: { name?: string; id?: string | number }
): Promise<void> {
  try {
    // 如果提供了用户信息，使用用户名称作为文件名
    if (userInfo?.name) {
      fileName = `${userInfo.name}_简历`;
      if (userInfo.id) {
        fileName += `_${userInfo.id}`;
      }
    }
    
    // 使用通用PDF导出函数
    await exportToPDF(resumeElement, fileName, {
      format: 'a4',
      orientation: 'portrait',
      margin: 10,
      scale: 2, // 提高清晰度
      title: userInfo?.name ? `${userInfo.name}的简历` : '简历'
    });
    
    console.log('简历导出成功');
  } catch (error) {
    console.error('简历导出失败:', error);
    throw error;
  }
}

/**
 * 导出统计报表为PDF
 * @param reportElement 报表HTML元素或其ID
 * @param fileName 文件名（不包含扩展名）
 * @param title 报表标题
 */
export async function exportReportToPDF(
  reportElement: HTMLElement | string,
  fileName: string = 'report',
  title: string = '统计报表'
): Promise<void> {
  try {
    // 使用通用PDF导出函数
    await exportToPDF(reportElement, fileName, {
      format: 'a4',
      orientation: 'landscape', // 横向布局更适合报表
      margin: 15,
      scale: 1.5,
      title
    });
    
    console.log('报表导出成功');
  } catch (error) {
    console.error('报表导出失败:', error);
    throw error;
  }
}
