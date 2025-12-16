---
description: 面向对象 + 事件驱动的前端架构设计模式
globs: 
  - "src/**/*.{js,jsx,ts,tsx}"
alwaysApply: false
---

# 面向对象 + 事件驱动架构规范

> 适用于数据结构复杂、交互逻辑个性化、需要精细控制渲染时机的场景。

---

## 适用场景

✅ **适用**：树形/图形数据、多实例协同、跨层级通信、富交互界面、长生命周期数据、业务频繁迭代

> 业务频繁迭代：需求不稳定时，Model 层隔离变化、事件机制松耦合、UI 可独立重构，降低维护成本。

❌ **不适用**：表单验证提交、简单CRUD、纯展示组件

**判断标准**：
1. 数据有没有自己的"行为"？没有 → 不需要 Model
2. UI 状态有没有跨组件共享？没有 → 不需要 ViewModel
3. 有没有复杂的实例间协调？没有 → 不需要 Store

> 能用简单方案解决的，就不要引入复杂架构。

---

## 核心理念

**数据是一等公民，组件是数据的投影。**

数据模型独立于任何视图框架，有自己的生命周期、行为和事件。组件只是订阅数据变化并渲染的"观察者"。

---

## 架构分层

```
View Layer        → 订阅事件，渲染 UI，无业务逻辑
ViewModel Layer   → UI 状态：选中、展开、加载中、DOM引用
Model Layer       → 业务数据、CRUD、关系、序列化
Store Layer       → 全局状态、集合管理、跨实例协调
```

---

## Model 设计模板

```javascript
import EventEmitter from "events";

class Model {
  #emitter = new EventEmitter();
  vm = new ViewModel(this);  // 组合 ViewModel
  
  constructor(data) {
    this.id = generateId();
    this.data = data;
  }
  
  // 数据操作 - 修改后触发事件
  update(patch) {
    Object.assign(this.data, patch);
    this.#emitter.emit("change", { data: this.data });
  }
  
  // 事件订阅 - 必须返回取消函数
  on(event, handler) {
    this.#emitter.on(event, handler);
    return () => this.#emitter.off(event, handler);
  }
  
  emit(event, payload) {
    this.#emitter.emit(event, payload);
  }
}
```

---

## ViewModel 设计模板

```javascript
class ViewModel {
  #emitter = new EventEmitter();
  #selected = false;
  #expanded = true;
  #loading = false;
  
  domRef = null;
  
  constructor(model) {
    this.model = model;
  }
  
  // 选中
  select() {
    this.#selected = true;
    this.#emitter.emit("select-change", true);
  }
  
  deselect() {
    this.#selected = false;
    this.#emitter.emit("select-change", false);
  }
  
  isSelected() { return this.#selected; }
  
  // 展开折叠
  expand() {
    this.#expanded = true;
    this.#emitter.emit("expand-change", true);
  }
  
  collapse() {
    this.#expanded = false;
    this.#emitter.emit("expand-change", false);
  }
  
  isExpanded() { return this.#expanded; }
  
  // 加载状态
  setLoading(status) {
    this.#loading = status;
    this.#emitter.emit("loading-change", status);
  }
  
  isLoading() { return this.#loading; }
  
  // DOM 操作
  setDomRef(element) {
    this.domRef = element;
    this.#emitter.emit("dom-ready", element);
  }
  
  scrollIntoView() {
    this.domRef?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  
  // 事件订阅
  on(event, handler) {
    this.#emitter.on(event, handler);
    return () => this.#emitter.off(event, handler);
  }
}
```

---

## Store 单例模板

```javascript
class Store {
  #emitter = new EventEmitter();
  items = [];
  selected = null;
  
  add(item) {
    this.items.push(item);
    this.#emitter.emit("change");
  }
  
  remove(item) {
    const index = this.items.indexOf(item);
    if (index > -1) this.items.splice(index, 1);
    this.#emitter.emit("change");
  }
  
  // 单选互斥逻辑
  select(item) {
    if (this.selected) this.selected.vm.deselect();
    this.selected = item;
    item.vm.select();
    this.#emitter.emit("selection-change", item);
  }
  
  on(event, handler) {
    this.#emitter.on(event, handler);
    return () => this.#emitter.off(event, handler);
  }
}

export const store = new Store();
```

---

## 树形结构模板

```javascript
class TreeNode extends Model {
  constructor(data, parent = null) {
    super(data);
    this.parent = parent;
    this.children = [];
    this.depth = parent ? parent.depth + 1 : 0;
  }
  
  addChild(child) {
    child.parent = this;
    child.depth = this.depth + 1;
    this.children.push(child);
    this.emit("children-change", { action: "add", child });
  }
  
  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parent = null;
      this.emit("children-change", { action: "remove", child });
    }
  }
  
  // 祖先链
  ancestors() {
    const chain = [];
    let node = this;
    while (node.parent) {
      chain.unshift(node.parent);
      node = node.parent;
    }
    return chain;
  }
  
  // 所有后代（前序遍历）
  descendants() {
    const result = [];
    const traverse = (n) => {
      result.push(n);
      n.children.forEach(traverse);
    };
    traverse(this);
    return result;
  }
  
  // 向上冒泡
  bubble(event, payload) {
    this.emit(event, payload);
    this.parent?.bubble(event, { ...payload, source: this });
  }
  
  // 向下广播
  broadcast(event, payload) {
    this.emit(event, payload);
    this.children.forEach(c => c.broadcast(event, payload));
  }
  
  // 序列化
  toJSON() {
    return {
      id: this.id,
      data: this.data,
      children: this.children.map(c => c.toJSON()),
    };
  }
}
```

---

## React Hooks 桥接

```javascript
// 订阅 Model 数据变化
function useModel(model) {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    return model.on("change", () => forceUpdate({}));
  }, [model]);
  
  return model.data;
}

// 订阅 ViewModel 状态
function useViewModel(model) {
  const [selected, setSelected] = useState(model.vm.isSelected());
  const [expanded, setExpanded] = useState(model.vm.isExpanded());
  const [loading, setLoading] = useState(model.vm.isLoading());
  
  useEffect(() => {
    const unsubs = [
      model.vm.on("select-change", setSelected),
      model.vm.on("expand-change", setExpanded),
      model.vm.on("loading-change", setLoading),
    ];
    return () => unsubs.forEach(fn => fn());
  }, [model]);
  
  return { selected, expanded, loading };
}
```

---

## 组件模板

```jsx
function ItemComponent({ model }) {
  const data = useModel(model);
  const { selected, expanded, loading } = useViewModel(model);
  const [children, setChildren] = useState(model.children);
  
  useEffect(() => {
    return model.on("children-change", () => setChildren([...model.children]));
  }, [model]);
  
  const ref = useCallback((el) => {
    if (el) model.vm.setDomRef(el);
  }, [model]);
  
  return (
    <div ref={ref} className={classnames({ selected, loading })}>
      <div onClick={() => store.select(model)}>{data.name}</div>
      {expanded && children.map(child => (
        <ItemComponent key={child.id} model={child} />
      ))}
    </div>
  );
}
```

---

## 异步加载模板

```javascript
class AsyncModel extends Model {
  async load() {
    if (this.vm.isLoading()) return;
    
    this.vm.setLoading(true);
    this.vm.setError(null);
    
    try {
      const data = await fetchData(this.id);
      this.update(data);
    } catch (error) {
      this.vm.setError(error);
    } finally {
      this.vm.setLoading(false);
    }
  }
}

// 懒加载子节点
class LazyTreeNode extends TreeNode {
  #loaded = false;
  
  async loadChildren() {
    if (this.#loaded) return;
    
    this.vm.setLoading(true);
    try {
      const data = await fetchChildren(this.id);
      data.forEach(d => this.addChild(new LazyTreeNode(d, this)));
      this.#loaded = true;
    } finally {
      this.vm.setLoading(false);
    }
  }
  
  expand() {
    if (!this.#loaded) {
      this.loadChildren().then(() => this.vm.expand());
    } else {
      this.vm.expand();
    }
  }
}
```

---

## 事件命名语义化

```javascript
// ✅ 语义化事件名
model.emit("child-added", { child });
model.emit("child-removed", { child, index });
model.emit("renamed", { oldName, newName });
model.emit("moved", { fromParent, toParent });

// ❌ 避免泛化事件
model.emit("change");  // 不知道什么变了
model.emit("update");  // 无法精准响应
```

---

## 规则检查清单

### 必须遵守

- [ ] Model 不引用任何视图框架（React/Vue）
- [ ] 事件订阅必须返回取消函数
- [ ] 使用 `#` 私有字段封装内部状态
- [ ] 组件在 useEffect cleanup 中取消所有订阅
- [ ] ViewModel 与 Model 通过组合关联

### 禁止事项

- [ ] 在 Model/ViewModel 中使用 useState/useEffect
- [ ] 在组件中写业务逻辑
- [ ] 直接修改私有字段
- [ ] 事件订阅不返回取消函数
- [ ] 继承代替组合

### 质量判断

> 如果把 React 换成 Vue，Model 和 ViewModel 需要改多少？
> 
> 理想答案：零修改。
