import type { App } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Element Plus 组件
import {
  // 基础组件
  ElButton,
  ElButtonGroup,
  ElLink,
  ElSpace,
  ElDivider,

  // 表单组件
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElOptionGroup,
  ElCheckbox,
  ElCheckboxGroup,
  ElRadio,
  ElRadioGroup,
  ElRadioButton,
  ElSwitch,
  ElSlider,
  ElTimePicker,
  ElDatePicker,
  ElRate,
  ElColorPicker,
  ElTransfer,
  ElCascader,
  ElUpload,

  // 数据展示组件
  ElTable,
  ElTableColumn,
  ElTag,
  ElProgress,
  ElTree,
  ElPagination,
  ElBadge,
  ElAvatar,
  ElSkeleton,
  ElSkeletonItem,
  ElEmpty,
  ElDescriptions,
  ElDescriptionsItem,
  ElResult,
  ElStatistic,

  // 导航组件
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElMenuItemGroup,
  ElTabs,
  ElTabPane,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElPageHeader,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElSteps,
  ElStep,
  ElScrollbar,

  // 反馈组件
  ElAlert,
  ElDialog,
  ElDrawer,
  ElPopover,
  ElPopconfirm,
  ElTooltip,
  ElCollapse,
  ElCollapseItem,
  ElTimeline,
  ElTimelineItem,

  // 布局组件
  ElRow,
  ElCol,
  ElContainer,
  ElHeader,
  ElFooter,
  ElMain,
  ElAside,
  ElCard,

  // 其他组件
  ElAffix,
  ElConfigProvider,
  ElIcon,
  ElImage,
  ElCalendar,
  ElCarousel,
  ElCarouselItem,
  ElCollapse as ElCollapse2, // 避免重复导入
  ElCollapseTransition,
  ElAutocomplete,
} from 'element-plus'

// 样式导入
import 'element-plus/es/components/base/style/css'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/button-group/style/css'
import 'element-plus/es/components/link/style/css'
import 'element-plus/es/components/space/style/css'
import 'element-plus/es/components/divider/style/css'
import 'element-plus/es/components/form/style/css'
import 'element-plus/es/components/form-item/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/input-number/style/css'
import 'element-plus/es/components/select/style/css'
import 'element-plus/es/components/option/style/css'
import 'element-plus/es/components/option-group/style/css'
import 'element-plus/es/components/checkbox/style/css'
import 'element-plus/es/components/checkbox-group/style/css'
import 'element-plus/es/components/radio/style/css'
import 'element-plus/es/components/radio-group/style/css'
import 'element-plus/es/components/radio-button/style/css'
import 'element-plus/es/components/switch/style/css'
import 'element-plus/es/components/slider/style/css'
import 'element-plus/es/components/time-picker/style/css'
import 'element-plus/es/components/date-picker/style/css'
import 'element-plus/es/components/rate/style/css'
import 'element-plus/es/components/color-picker/style/css'
import 'element-plus/es/components/transfer/style/css'
import 'element-plus/es/components/cascader/style/css'
import 'element-plus/es/components/upload/style/css'
import 'element-plus/es/components/table/style/css'
import 'element-plus/es/components/table-column/style/css'
import 'element-plus/es/components/tag/style/css'
import 'element-plus/es/components/progress/style/css'
import 'element-plus/es/components/tree/style/css'
import 'element-plus/es/components/pagination/style/css'
import 'element-plus/es/components/badge/style/css'
import 'element-plus/es/components/avatar/style/css'
import 'element-plus/es/components/skeleton/style/css'
import 'element-plus/es/components/skeleton-item/style/css'
import 'element-plus/es/components/empty/style/css'
import 'element-plus/es/components/descriptions/style/css'
import 'element-plus/es/components/descriptions-item/style/css'
import 'element-plus/es/components/result/style/css'
import 'element-plus/es/components/statistic/style/css'
import 'element-plus/es/components/menu/style/css'
import 'element-plus/es/components/menu-item/style/css'
import 'element-plus/es/components/sub-menu/style/css'
import 'element-plus/es/components/menu-item-group/style/css'
import 'element-plus/es/components/tabs/style/css'
import 'element-plus/es/components/tab-pane/style/css'
import 'element-plus/es/components/breadcrumb/style/css'
import 'element-plus/es/components/breadcrumb-item/style/css'
import 'element-plus/es/components/page-header/style/css'
import 'element-plus/es/components/dropdown/style/css'
import 'element-plus/es/components/dropdown-item/style/css'
import 'element-plus/es/components/dropdown-menu/style/css'
import 'element-plus/es/components/steps/style/css'
import 'element-plus/es/components/step/style/css'
import 'element-plus/es/components/alert/style/css'
import 'element-plus/es/components/dialog/style/css'
import 'element-plus/es/components/drawer/style/css'
import 'element-plus/es/components/popover/style/css'
import 'element-plus/es/components/popconfirm/style/css'
import 'element-plus/es/components/tooltip/style/css'
import 'element-plus/es/components/collapse/style/css'
import 'element-plus/es/components/collapse-item/style/css'
import 'element-plus/es/components/timeline/style/css'
import 'element-plus/es/components/timeline-item/style/css'
import 'element-plus/es/components/row/style/css'
import 'element-plus/es/components/col/style/css'
import 'element-plus/es/components/container/style/css'
import 'element-plus/es/components/header/style/css'
import 'element-plus/es/components/footer/style/css'
import 'element-plus/es/components/main/style/css'
import 'element-plus/es/components/aside/style/css'
import 'element-plus/es/components/card/style/css'
import 'element-plus/es/components/affix/style/css'
import 'element-plus/es/components/config-provider/style/css'
import 'element-plus/es/components/icon/style/css'
import 'element-plus/es/components/image/style/css'
import 'element-plus/es/components/calendar/style/css'
import 'element-plus/es/components/carousel/style/css'
import 'element-plus/es/components/carousel-item/style/css'
import 'element-plus/es/components/collapse-transition/style/css'
import 'element-plus/es/components/autocomplete/style/css'
import 'element-plus/es/components/scrollbar/style/css'

// 指令 (尝试引入 Loading 指令)
// 注意：按需引入指令的方式可能因版本而异，这里是一种尝试
// 如果报错，可能需要查阅 Element Plus 文档确认正确的按需引入指令方式
import { ElLoading } from 'element-plus'

// 组件列表
const components = [
  // 基础组件
  ElButton,
  ElButtonGroup,
  ElLink,
  ElSpace,
  ElDivider,

  // 表单组件
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElOptionGroup,
  ElCheckbox,
  ElCheckboxGroup,
  ElRadio,
  ElRadioGroup,
  ElRadioButton,
  ElSwitch,
  ElSlider,
  ElTimePicker,
  ElDatePicker,
  ElRate,
  ElColorPicker,
  ElTransfer,
  ElCascader,
  ElUpload,

  // 数据展示组件
  ElTable,
  ElTableColumn,
  ElTag,
  ElProgress,
  ElTree,
  ElPagination,
  ElBadge,
  ElAvatar,
  ElSkeleton,
  ElSkeletonItem,
  ElEmpty,
  ElDescriptions,
  ElDescriptionsItem,
  ElResult,
  ElStatistic,

  // 导航组件
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElMenuItemGroup,
  ElTabs,
  ElTabPane,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElPageHeader,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElSteps,
  ElStep,
  ElScrollbar,

  // 反馈组件
  ElAlert,
  ElDialog,
  ElDrawer,
  ElPopover,
  ElPopconfirm,
  ElTooltip,
  ElCollapse,
  ElCollapseItem,
  ElTimeline,
  ElTimelineItem,

  // 布局组件
  ElRow,
  ElCol,
  ElContainer,
  ElHeader,
  ElFooter,
  ElMain,
  ElAside,
  ElCard,

  // 其他组件
  ElAffix,
  ElConfigProvider,
  ElIcon,
  ElImage,
  ElCalendar,
  ElCarousel,
  ElCarouselItem,
  ElCollapseTransition,
  ElAutocomplete,
]

// 插件安装函数
export default {
  install(app: App) {
    // 注册所有组件
    components.forEach(component => {
      if (component.name) {
        app.component(component.name, component)
      }
    })

    // 尝试注册 Loading 指令
    app.directive('loading', ElLoading.directive)

    // 全局注册图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }
  }
}
