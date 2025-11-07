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
            class="pl-9 pr-3 py-1.5 w-full sm:w-56 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            @keyup.enter="handleSearch"
          >
          <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                标题
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分类
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                浏览
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                收藏
              </th>
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
                    <div class="text-sm font-medium text-gray-900">{{ skill.title }}</div>
                    <div class="text-sm text-gray-500">{{ skill.title_en }}</div>
                  </div>
                  <span v-if="skill.featured" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    精选
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ getCategoryName(skill.category_id) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getStatusClass(skill.status)"
                >
                  {{ getStatusText(skill.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center">
                  <svg class="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {{ skill.view_count }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center">
                  <svg class="h-4 w-4 text-red-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {{ skill.like_count }}
                </div>
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
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  技能来源
                </label>
                <input
                  v-model="form.source"
                  type="text"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="例如：官方文档、社区教程"
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
                >
              </div>
              <div class="md:col-span-2 lg:col-span-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  安装命令
                </label>
                <input
                  v-model="form.install_command"
                  type="text"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="例如：npm install package-name"
                >
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
                  @keyup.enter="addTag"
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
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">英文描述</label>
                  <textarea
                    v-model="form.description_en"
                    rows="3"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Enter skill description"
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
const searchQuery = ref('')
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const newTag = ref('')

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
    skills.value = data.items || []
    total.value = data.total || 0
    limit.value = data.pageSize || limit.value
  } catch (err: any) {
    console.error('加载技能失败: ', err)
  } finally {
    loading.value = false
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
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    newTag.value = ''
  }
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

/**
 * 获取状态样式（仅支持 published/draft/archived）。
 * 保持与表单下拉框枚举一致，避免出现未支持状态。
 * @param status 状态标识
 * @returns Tailwind 样式类字符串
 */
const getStatusClass = (status: string) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800'
    case 'archived':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

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

// 打开创建模态框
const openCreateModal = () => {
  resetForm()
  showCreateModal.value = true
}

// 编辑技能
const editSkill = (skill: Skill) => {
  editingSkill.value = skill
  form.value = { 
    ...skill,
    tags: Array.isArray(skill.tags) ? skill.tags : (skill.tags as string).split(',').map(tag => tag.trim()).filter(Boolean)
  }
  showEditModal.value = true
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

// 保存技能
/**
 * 保存技能：创建或更新。
 * - 使用管理员令牌鉴权，处理401。
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
    
    const url = showEditModal.value && editingSkill.value?.id 
      ? `/api/admin/skills/${editingSkill.value.id}`
      : '/api/admin/skills'
    
    const method = showEditModal.value ? 'PUT' : 'POST'
    
    const token = localStorage.getItem('admin_token')
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(form.value)
    })
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.message || `保存失败 (${res.status})`)
    }
    await res.json().catch(() => ({}))
    closeModal()
    await loadSkills()
  } catch (error) {
    console.error('保存技能失败:', error)
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
    view_count: 0,
    like_count: 0
  }
  contentError.value = false
}

// 关闭模态框
const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingSkill.value = null
  resetForm()
}

// 监听筛选条件变化
watch([filters, searchQuery], () => {
  currentPage.value = 1
  loadSkills()
})

// 组件挂载时加载数据
onMounted(() => {
  loadSkills()
  loadCategories()
})
</script>