<template>
  <div class="space-y-6">
    <!-- 页面标题和操作区域 -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <h2 class="text-xl font-semibold leading-tight text-gray-900">技能管理</h2>
      
      <!-- 搜索和筛选区域 -->
      <div class="flex flex-col sm:flex-row gap-2">
        <!-- 搜索框 -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索技能..."
            class="pl-9 pr-8 py-1.5 w-full sm:w-56 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            @keyup.enter="handleSearch"
            v-select-all-shortcut
          >
          <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <!-- 清除按钮：有内容时显示 -->
          <button
            v-if="searchQuery"
            type="button"
            @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
            title="清除"
            aria-label="清除"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        
        <!-- 状态筛选 -->
        <select
          v-model="filters.status"
          class="px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
          <option value="archived">已归档</option>
        </select>
        
        <!-- 分类筛选 -->
        <select
          v-model="filters.category"
          class="px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">全部分类</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        
        <!-- 刷新按钮（统一 lucide-vue-next 图标风格） -->
        <button
          type="button"
          @click="loadSkills"
          title="刷新"
          aria-label="刷新"
          class="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
        >
          <RefreshCw class="h-4 w-4" />
        </button>
        
        <!-- 新建按钮 -->
        <button
          @click="openCreateModal"
          class="bg-orange-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-orange-700 transition-colors flex items-center gap-1.5"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新建技能
        </button>
      </div>
    </div>

    <!-- 技能列表 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <!-- 空状态（非加载时且无数据） -->
      <div v-if="!loading && skills.length === 0" class="p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">暂无技能</h3>
        <p class="mt-1 text-sm text-gray-500">开始创建您的第一个技能吧！</p>
        <div class="mt-6">
          <button
            @click="openCreateModal"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
          >
            新建技能
          </button>
        </div>
      </div>
      
      <!-- 技能表格（加载中也显示表头） -->
      <div v-if="loading || skills.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分类
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开发者</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">是否推荐</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">是否精选</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- 加载中行，保留表头 -->
            <tr v-if="loading">
              <td colspan="7" class="px-6 py-8 text-center">
                <div class="inline-flex items-center gap-2">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                  <span class="text-gray-600">加载中...</span>
                </div>
              </td>
            </tr>
            
            <!-- 数据行 -->
            <template v-else>
            <tr v-for="skill in skills" :key="skill.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ skill.title || skill.name }}</div>
                    <div class="text-sm text-gray-500">{{ skill.title_en || skill.name_en }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ getCategoryName(skill.category_id) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {{ skill.author_name || '官方' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="getStatusClass(skill.status)" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
                  {{ getStatusLabel(skill.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span v-if="skill.recommended" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">推荐</span>
                <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">—</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span v-if="skill.featured" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">精选</span>
                <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">—</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(skill.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="editSkill(skill)"
                    class="text-orange-600 hover:text-orange-700 inline-flex items-center"
                    title="编辑"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="showDeleteConfirm(skill)"
                    class="text-red-600 hover:text-red-700 inline-flex items-center"
                    title="删除"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>
      
      <!-- 分页 -->
      <div v-if="totalPages > 1" class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              显示第 <span class="font-medium">{{ (currentPage - 1) * limit + 1 }}</span> 到 <span class="font-medium">{{ Math.min(currentPage * limit, total) }}</span> 条，
              共 <span class="font-medium">{{ total }}</span> 条记录
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">上一页</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <button
                v-for="page in visiblePages" 
                :key="page"
                @click="goToPage(page)"
                :class="[
                  currentPage === page 
                    ? 'z-10 bg-orange-50 border-orange-500 text-orange-600' 
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                ]"
              >
                {{ page }}
              </button>
              
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">下一页</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">确认删除</h3>
              <p class="text-sm text-gray-500 mt-1">
                确定要删除技能 "{{ skillToDelete?.title }}" 吗？此操作无法撤销。
              </p>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            取消
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑技能模态框 -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <!-- 模态框头部 -->
        <div class="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ showEditModal ? '编辑技能' : '新建技能' }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- 模态框内容区域 -->
        <div class="flex-1 overflow-y-auto p-6">
          
          <form @submit.prevent="saveSkill">
            
            <!-- 基本信息区域 -->
          <div class="bg-gray-50 rounded-lg p-3 mb-5">
            <h4 class="text-base font-medium text-gray-900 mb-3">基本信息</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  标题 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="输入技能标题"
                  required
                  v-select-all-shortcut
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  英文标题
                </label>
                <input
                  v-model="form.title_en"
                  type="text"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter skill title"
                  v-select-all-shortcut
                >
              </div>
            </div>
          </div>
                
          <!-- 配置信息区域 -->
          <div class="bg-blue-50 rounded-lg p-3 mb-5">
            <h4 class="text-base font-medium text-gray-900 mb-3">配置信息</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  分类 <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.category_id"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                >
                  <option value="">选择分类</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <!-- 开发者（作者） -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  开发者（作者） <span class="text-gray-400 text-xs">可选</span>
                </label>
                <input
                  v-model="form.author_name"
                  type="text"
                  :class="[
                    'w-full px-2.5 py-1.5 text-sm border rounded-md focus:ring-2 transition-colors',
                    authorNameError ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                  ]"
                  placeholder="输入开发者名称(可选)"
                  v-select-all-shortcut
                >
                <p class="mt-1 text-xs text-gray-500">留空则在前端显示为“官方”。</p>
                <p v-if="authorNameError" class="mt-1 text-xs text-red-600">{{ authorNameError }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  技能来源
                </label>
                <input
                  v-model="form.source"
                  type="text"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="例如：官方文档、社区教程"
                  v-select-all-shortcut
                >
              </div>
              <div class="md:col-span-2 lg:col-span-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Git地址
                </label>
                <input
                  v-model="form.git_url"
                  type="url"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="https://github.com/..."
                  v-select-all-shortcut
                >
              </div>
              <div class="md:col-span-2 lg:col-span-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  安装命令
                </label>
                <textarea
                  v-model="form.install_command"
                  rows="4"
                  ref="installCommandRef"
                  @input="autoResizeInstallCommand($event)"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors leading-relaxed resize-none overflow-hidden"
                  placeholder="例如：npm install package-name"
                  v-select-all-shortcut
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  状态
                </label>
                <select
                  v-model="form.status"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                  <option value="archived">已归档</option>
                </select>
              </div>
            </div>
            
            <!-- 精选和标签 -->
            <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="flex items-center space-x-2">
                  <input
                    v-model="form.featured"
                    type="checkbox"
                    class="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  >
                  <span class="text-sm font-medium text-gray-700">设为精选技能</span>
                </label>
              </div>
              <div>
                <label class="flex items-center space-x-2">
                  <input
                    v-model="form.recommended"
                    type="checkbox"
                    class="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  >
                  <span class="text-sm font-medium text-gray-700">设为推荐技能</span>
                </label>
              </div>
            </div>
            
            <!-- 标签 -->
            <div class="mt-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">标签</label>
              <div class="flex flex-wrap gap-2 mb-2">
                <span
                  v-for="(tag, index) in form.tags"
                  :key="index"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                >
                  {{ tag }}
                  <button
                    type="button"
                    @click="removeTag(index)"
                    class="ml-1 inline-flex text-orange-600 hover:text-orange-800"
                  >
                    <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
              <div class="flex gap-2">
                <input
                  v-model="newTag"
                  type="text"
                  placeholder="添加标签"
                  class="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  @keydown.enter.stop.prevent="addTag"
                  v-select-all-shortcut
                >
                <button
                  type="button"
                  @click="addTag"
                  class="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
              
            <!-- 描述内容区域 -->
            <div class="bg-green-50 rounded-lg p-3 mb-5">
              <h4 class="text-base font-medium text-gray-900 mb-3">描述内容</h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="输入技能描述"
                  v-select-all-shortcut
                ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">英文描述</label>
                <textarea
                  v-model="form.description_en"
                  rows="3"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter skill description"
                  v-select-all-shortcut
                ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">技能内容 <span class="text-red-500">*</span></label>
                <textarea
                  v-model="form.content"
                  rows="6"
                  :class="[
                    'w-full px-2.5 py-1.5 text-sm border rounded-md focus:ring-2 transition-colors',
                    contentError ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                  ]"
                  placeholder="输入详细的技能内容"
                  v-select-all-shortcut
                ></textarea>
                  <p v-if="contentError" class="mt-1 text-xs text-red-600">请填写技能内容，不能为空。</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">英文内容</label>
                <textarea
                  v-model="form.content_en"
                  rows="6"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter detailed skill content"
                  v-select-all-shortcut
                ></textarea>
                </div>
              </div>
            </div>
            
            <!-- 表单操作按钮 -->
            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                @click="closeModal"
                class="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                :disabled="saving"
              >
                取消
              </button>
              <button
                type="button"
                @click="openPreview"
                class="px-3 py-1.5 text-sm border border-orange-600 text-orange-600 rounded-md hover:bg-orange-50 transition-colors disabled:opacity-50"
                :disabled="saving || !editingSkill"
              >
                预览
              </button>
              <button
                type="submit"
                class="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                :disabled="saving"
              >
                <svg v-if="saving" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ editingSkill ? '更新技能' : '创建技能' }}</span>
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshCw, X } from 'lucide-vue-next'

interface Skill {
  id: string
  title: string
  title_en?: string
  description?: string
  description_en?: string
  content: string
  content_en?: string
  category_id: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_time?: number
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  view_count: number
  like_count: number
  featured: boolean
  recommended: boolean
  source?: string
  git_url?: string
  install_command?: string
  created_at: string
  /**
   * 可选的作者名称，用于在前端展示作者身份。
   * 为空时前端显示为“官方”。
   */
  author_name?: string
}

interface Category {
  id: string
  name: string
  name_en?: string
}

const skills = ref<Skill[]>([])
const categories = ref<Category[]>([])
const router = useRouter()
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingSkill = ref<Skill | null>(null)
const skillToDelete = ref<Skill | null>(null)
const loading = ref(false)
const saving = ref(false)
const contentError = ref(false)
const authorNameError = ref<string | null>(null)
const searchQuery = ref('')
/**
 * 清除搜索关键字并重置分页，随后重新加载技能列表。
 * 当输入框有内容时显示清除图标，点击后置空并触发搜索。
 */
const clearSearch = (): void => {
  if (!searchQuery.value) return
  searchQuery.value = ''
  currentPage.value = 1
  loadSkills()
}
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const newTag = ref('')
// 安装命令文本域引用
const installCommandRef = ref<HTMLTextAreaElement | null>(null)

const filters = ref({
  status: '',
  category: ''
})

const form = ref({
  title: '',
  title_en: '',
  description: '',
  description_en: '',
  content: '',
  content_en: '',
  category_id: '',
  difficulty_level: 'beginner' as const,
  estimated_time: 0,
  tags: [] as string[],
  status: 'draft' as const,
  featured: false,
  recommended: false,
  source: '',
  git_url: '',
  install_command: '',
  author_name: '',
  view_count: 0,
  like_count: 0
})

// 计算总页数
const totalPages = computed(() => Math.ceil(total.value / limit.value))

// 计算可见页码
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 加载技能列表
/**
 * 加载技能列表，支持搜索/筛选/分页。
 * - 使用管理员令牌鉴权，处理401跳转登录。
 * - 网络中断进行一次重试，提升稳定性。
 * - 解析后端统一响应：items、total、pageSize。
 */
const loadSkills = async (): Promise<void> => {
  loading.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const params = new URLSearchParams({
      page: String(currentPage.value),
      limit: String(limit.value)
    })
    if (searchQuery.value.trim()) params.append('q', searchQuery.value.trim())
    if (filters.value.status) params.append('status', filters.value.status)
    if (filters.value.category) params.append('category', filters.value.category)

    const url = `/api/admin/skills?${params.toString()}`
    const doFetch = async () => fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    let res: Response
    try {
      res = await doFetch()
    } catch (e: any) {
      // 网络中断重试一次
      await new Promise(r => setTimeout(r, 300))
      res = await doFetch()
    }

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.message || `加载技能失败 (${res.status})`)
    }

    const data = await res.json()
    const items = Array.isArray(data.items) ? data.items : []
    skills.value = items.map((it: any) => ({
      ...it,
      // 统一名称字段，后端可能返回 name
      title: it.title ?? it.name ?? '',
      title_en: it.title_en ?? it.name_en ?? '',
      // 统一并规范化标签为字符串数组
      /**
       * 将后端返回的 tags 规范化为字符串数组。
       * - 若为字符串以逗号分隔，则拆分后去空格与空值。
       * - 若为对象数组，则取 name 字段。
       * - 若为数组则逐项转字符串。
       */
      tags: Array.isArray(it.tags)
        ? Array.from(new Set(it.tags.map((t: any) => (typeof t === 'string' ? t : (t?.name || ''))).map((s: string) => s.trim()).filter(Boolean)))
        : (typeof it.tags === 'string' && it.tags
          ? Array.from(new Set(it.tags.split(',').map((s: string) => s.trim()).filter(Boolean)))
          : []),
      // 状态默认值
      status: it.status ?? 'draft',
      // 补齐推荐字段默认值
      recommended: it.recommended ?? false
    }))
    total.value = data.total || 0
    limit.value = data.pageSize || limit.value
  } catch (err: any) {
    console.error('加载技能失败: ', err)
  } finally {
    loading.value = false
  }
}

/**
 * 将后端状态值映射为中文文案。
 * @param status 技能状态：draft/published/archived
 * @returns 中文文案
 */
const getStatusLabel = (status?: string): string => {
  switch (status) {
    case 'published':
      return '已发布'
    case 'archived':
      return '已归档'
    case 'draft':
    default:
      return '草稿'
  }
}

/**
 * 根据技能状态返回徽标样式类。
 * - 草稿：灰色
 * - 已发布：绿色
 * - 已归档：橙色
 * @param status 技能状态
 * @returns Tailwind 类名字符串
 */
const getStatusClass = (status?: string): string => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800'
    case 'archived':
      return 'bg-orange-100 text-orange-800'
    case 'draft':
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

// 加载分类列表
/**
 * 加载分类列表（用于下拉选择）。
 * 复用分类接口的鉴权与错误处理模式。
 */
const loadCategories = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('admin_token')
    const doFetch = async () => fetch('/api/admin/categories', {
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    let res: Response
    try {
      res = await doFetch()
    } catch (e: any) {
      await new Promise(r => setTimeout(r, 300))
      res = await doFetch()
    }
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.message || `加载分类失败 (${res.status})`)
    }
    const data = await res.json()
    categories.value = data.items || []
  } catch (err) {
    console.error('加载分类失败:', err)
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  loadSkills()
}

// 分页处理
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadSkills()
  }
}

// 标签管理
/**
 * 添加标签（仅在显式触发时执行）。
 * - 去除左右空格，避免重复标签。
 * - 与输入框 `@keydown.enter.stop.prevent` 配合，防止表单提交与事件冒泡。
 */
const addTag = () => {
  const tag = newTag.value.trim()
  if (!tag) return
  if (!form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  newTag.value = ''
}

const removeTag = (index: number) => {
  form.value.tags.splice(index, 1)
}

// 获取分类名称
const getCategoryName = (categoryId: string) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '-'
}

// 获取难度文本
const getDifficultyText = (level: string) => {
  switch (level) {
    case 'beginner':
      return '初级'
    case 'intermediate':
      return '中级'
    case 'advanced':
      return '高级'
    default:
      return '未知'
  }
}

// 重复定义的 getStatusClass 已移除，保留上方统一实现（草稿灰、发布绿、归档橙）

/**
 * 获取状态中文文案（仅支持 published/draft/archived）。
 * 保持与表单下拉框枚举一致。
 * @param status 状态标识
 * @returns 中文文案
 */
const getStatusText = (status: string) => {
  switch (status) {
    case 'published':
      return '已发布'
    case 'draft':
      return '草稿'
    case 'archived':
      return '已归档'
    default:
      return status
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 验证作者名称字段。
 * 允许中英文、数字、空格和 .-_ 字符，长度 2-30。
 * 为空视为合法（前端显示“官方”）。
 * @returns 是否有效
 */
const validateAuthorName = (): boolean => {
  const raw = form.value.author_name ?? ''
  const value = raw.trim()
  if (!value) {
    authorNameError.value = null
    return true
  }
  const re = /^[\p{L}A-Za-z0-9\s._-]{2,30}$/u
  const ok = re.test(value)
  authorNameError.value = ok ? null : '作者名需为2-30字符，支持中英文、数字、空格及 -_.'
  return ok
}

// 打开创建模态框
const openCreateModal = () => {
  resetForm()
  showCreateModal.value = true
}

// 编辑技能
/**
 * 规范化并填充编辑表单数据，确保字段安全可用。
 * - 对 tags 进行空值保护与规范化（字符串以逗号分隔转数组）。
 * - 兼容后端返回 name/name_en 字段作为标题。
 * - 对布尔与数字字段设置合理默认值，避免 undefined 造成 UI/逻辑错误。
 * @param skill 待编辑的技能项
 */
const editSkill = (skill: Skill) => {
  try {
    editingSkill.value = skill

    /**
     * 规范化编辑时的标签输入：
     * - 支持字符串/数组/对象数组，统一为字符串数组，去重去空。
     */
    const normalizedTags = Array.isArray((skill as any).tags)
      ? Array.from(new Set((skill as any).tags.map((t: any) => (typeof t === 'string' ? t : (t?.name || ''))).map((s: string) => s.trim()).filter(Boolean)))
      : (typeof (skill as any).tags === 'string' && (skill as any).tags
        ? Array.from(new Set((skill as any).tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)))
        : [])

    form.value = {
      title: (skill as any).title ?? (skill as any).name ?? '',
      title_en: (skill as any).title_en ?? (skill as any).name_en ?? '',
      description: (skill as any).description ?? '',
      description_en: (skill as any).description_en ?? '',
      content: (skill as any).content ?? '',
      content_en: (skill as any).content_en ?? '',
      category_id: (skill as any).category_id ?? '',
      difficulty_level: (skill as any).difficulty_level ?? 'beginner',
      estimated_time: (skill as any).estimated_time ?? 0,
      tags: normalizedTags,
      status: (skill as any).status ?? 'draft',
      featured: !!(skill as any).featured,
      recommended: !!(skill as any).recommended,
      source: (skill as any).source ?? '',
      git_url: (skill as any).git_url ?? (skill as any).repo_url ?? '',
      install_command: (skill as any).install_command ?? '',
      author_name: (skill as any).author_name ?? '',
      view_count: (skill as any).view_count ?? 0,
      like_count: (skill as any).like_count ?? 0
    }

    showEditModal.value = true
  } catch (error) {
    console.error('编辑技能失败:', error)
  }
}

// 显示删除确认
/**
 * 展示删除确认模态。
 */
const showDeleteConfirm = (skill: Skill) => {
  skillToDelete.value = skill
  showDeleteModal.value = true
}

// 确认删除
/**
 * 确认删除技能，包含鉴权与错误处理。
 */
const confirmDelete = async () => {
  if (!skillToDelete.value?.id) return
  
  try {
    const token = localStorage.getItem('admin_token')
    const res = await fetch(`/api/admin/skills/${skillToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.message || `删除失败 (${res.status})`)
    }
    await res.json().catch(() => ({}))
    showDeleteModal.value = false
    skillToDelete.value = null
    await loadSkills()
  } catch (error) {
    console.error('删除技能失败:', error)
  }
}

/**
 * 自动调整安装命令文本域高度，避免滚动条。
 * 每次输入时先重置为 auto，再设置为 scrollHeight。
 * @param {Event} evt 输入事件对象
 */
const autoResizeInstallCommand = (evt: Event): void => {
  const el = evt.target as HTMLTextAreaElement | null
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

// 保存技能
/**
 * 保存技能：创建或更新。
 * - 使用管理员令牌鉴权，处理401。
 * - 规范化可选字段：`author_name`、`git_url`、`install_command`（空值写入 null）。
 */
const saveSkill = async () => {
  try {
    saving.value = true
    // 本地必填校验：内容不能为空
    contentError.value = !form.value.content || !form.value.content.trim()
    if (contentError.value) {
      saving.value = false
      return
    }
    // 作者名称校验
    const authorOk = validateAuthorName()
    if (!authorOk) {
      saving.value = false
      return
    }
    
    const url = showEditModal.value && editingSkill.value?.id 
      ? `/api/admin/skills/${editingSkill.value.id}`
      : '/api/admin/skills'
    
    const method = showEditModal.value ? 'PUT' : 'POST'
    
    const token = localStorage.getItem('admin_token')
    // 修剪 author_name/git_url/install_command，空值用 null 传递
    const payload = {
      ...form.value,
      author_name: form.value.author_name?.trim() || null,
      git_url: form.value.git_url?.trim() || null,
      install_command: form.value.install_command?.trim() || null
    }
    // 记录请求概要，避免日志过大
    console.debug('[saveSkill] 请求准备:', { url, method, hasToken: !!token, payloadKeys: Object.keys(payload) })
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }
      // 优先解析 JSON，其次回退为纯文本
      const text = await res.text().catch(() => '')
      let data: any = {}
      try { data = text ? JSON.parse(text) : {} } catch {}
      const msg = data?.message || data?.error || res.statusText || '未知错误'
      console.error('[saveSkill] 请求失败详情:', {
        url,
        method,
        status: res.status,
        statusText: res.statusText,
        response: text?.slice(0, 500) // 避免过长
      })
      throw new Error(`保存失败 (${res.status}): ${msg}`)
    }
    await res.json().catch(() => ({}))
    closeModal()
    await loadSkills()
  } catch (error) {
    // 更详细的错误输出
    console.error('保存技能失败:', {
      message: (error as any)?.message || String(error),
      stack: (error as any)?.stack
    })
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    content: '',
    content_en: '',
    category_id: '',
    difficulty_level: 'beginner' as const,
    estimated_time: 0,
    status: 'draft' as const,
    featured: false,
    recommended: false,
    source: '',
    git_url: '',
    install_command: '',
    tags: [],
    author_name: '',
    view_count: 0,
    like_count: 0
  }
  contentError.value = false
  authorNameError.value = null
}

// 关闭模态框
const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingSkill.value = null
  resetForm()
}

const openPreview = () => {
  const id = editingSkill.value?.id
  if (!id) return
  const url = `/skills/${id}`
  window.open(url, '_blank')
}

// 监听筛选条件变化
watch([filters, searchQuery], () => {
  currentPage.value = 1
  loadSkills()
})

// 实时校验作者字段
watch(() => form.value.author_name, () => {
  validateAuthorName()
})

// 组件挂载时加载数据
onMounted(() => {
  loadSkills()
  loadCategories()
  // 初始化时根据默认内容调整安装命令文本域高度
  if (installCommandRef.value) {
    installCommandRef.value.style.height = 'auto'
    installCommandRef.value.style.height = `${installCommandRef.value.scrollHeight}px`
  }
})
</script>
