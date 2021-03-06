import Filters from './filters';
import TodoList from './todoList';
import TodoListView from './todoListView';
import { requests } from '../api/requests';
import { activeFilter, findTodoId } from '../services/utils';
import MyEventEmitter from '../services/eventEmitter';

export default class Controller extends MyEventEmitter {
    constructor({ 
        todoInput = null,
        todoButton = null,
        completeAllBtn = null,
        todoListSelector = null,
        filterPanel = null,
        clearCompletedBtn = null,
        filtersList = null,
        todosArr = [],
        currentFilter = 'all' } = {}){
        super();
        this.todosArr = todosArr;
        this.currentFilter = currentFilter;
        this.todoListSelector = document.querySelector(todoListSelector);
        
        this.todoListView = new TodoListView(this.todoListSelector);
        this.todoInput = document.querySelector(todoInput);
        this.filtersBtns = document.querySelector(filtersList);
        this.filterPanel = document.querySelector(filterPanel);
        this.todoButton = document.querySelector(todoButton);
        this.completeAllBtn = document.querySelector(completeAllBtn);
        this.clearCompletedBtn = document.querySelector(clearCompletedBtn);
        this.idsArr = [];


        this.filters = new Filters(this.completeAllBtn, this.filterPanel);
        this.filters.on('filtersRender', (todosArr) => {
            this.filters.render(todosArr);
        });

        this.todoList = new TodoList(this.todosArr, this.filters, this.currentFilter);
        this.todoList.on("addTodo", (newTodo) => {
            this.todoList.addTodo(newTodo);
        });
        this.todoList.on("render", (todosArr, currentFilter) => {
            this.filters.trigger('filtersRender', todosArr);
            this.todoListView.render(todosArr, currentFilter);
        });
        this.todoList.on("deleteTodo", (id) => {
            this.todoList.deleteTodo(id);
        });
    }

    handleAddTodo = async (e) => {
        e.preventDefault();

        const { todoInput } = this;

        if (todoInput.value === '') return;

        let newTodo = await requests.addTodo(todoInput.value);
        this.todoList.trigger("addTodo", newTodo);
        todoInput.value = '';
    }

    handleDeleteTodo = async (e) => {
        const id = findTodoId(e);
        
        
        if (e.target.dataset.trash !== 'trash' &&  e.target.dataset.clear !== 'clear-all') {
            return;
        }
    
        let deletedTodoId = await requests.deleteTodo(id);
        this.todoList.trigger('deleteTodo', deletedTodoId);
    }

    handleCheckTodo = async (e) => {
        const id = findTodoId(e);

        if (!(e.target.dataset.complete === 'complete')) {
            return;
        }

        if(!this.idsArr.includes(id)) {
            this.idsArr = [...this.idsArr, id];
        }
        let checkedTodo = await requests.checkTodo(id);
        
        this.todoList.todosArr = this.todoList.todosArr.map((todo) => todo._id === checkedTodo._id ? checkedTodo : todo);
        this.todoList.trigger('render', this.todoList.todosArr, this.todoList.currentFilter);
    }

    handleFiltersTodo = (e) => {
        this.todoList.currentFilter = activeFilter(e, this.filtersBtns);
        this.todoList.trigger('render', this.todoList.todosArr, this.todoList.currentFilter);
    }

    handleCompleteAll = async (e) => {
        e.preventDefault();
    

        this.todoList.todosArr = await requests.completeAll();
        this.todoList.trigger('render', this.todoList.todosArr, this.todoList.currentFilter);
    }

    handleClear = async () => {
        this.todoList.todosArr = await requests.clearCompleted(this.idsArr);

        this.todoList.trigger('render', this.todoList.todosArr, this.todoList.currentFilter);
        this.clearCompletedBtn.classList.remove('active-btn');
        this.idsArr = [];
    }

    handleUpdateText = async (e) => {
        const target = e.target;
    
        if (target.tagName !== 'LI' && target.tagName !== 'DIV') return;
    
        const textWrapper = target.parentElement;
        const textDiv = textWrapper.firstChild;
        const textInput = textWrapper.lastChild;
        const valueLength = textInput.value.length;
        const id = textWrapper.parentElement.dataset['id'];
    
        textDiv.classList.add('hidden');
        textInput.classList.remove('hidden');
        textInput.focus();
        textInput.setSelectionRange(valueLength, valueLength);

        
        textInput.onchange = async () => {
    
            if (textInput.value === '') return;

            let updatedTodo = await requests.updateTextInput(textInput.value, id);
            this.todoList.todosArr = this.todoList.todosArr.map((todo) => {
                if (todo._id === updatedTodo._id) {
                    todo.text = updatedTodo.text;
                    return todo;
                }
                return todo;
            });

            this.todoList.trigger('render', this.todoList.todosArr, this.todoList.currentFilter);
        }
    
        textInput.onblur = () => {
            this.todoList.trigger('render', this.todoList.todosArr, this.todoList.currentFilter);
        }
    }

    init = async () => {

        this.todoList.todosArr = await requests.getTodos();

        this.todoList.trigger('render', this.todoList.todosArr, this.currentFilter);
        this.filters.trigger('filtersRender', this.todoList.todosArr);

        this.todoButton.addEventListener("click", this.handleAddTodo);
        this.todoListSelector.addEventListener('click', (e) => {
            this.handleDeleteTodo(e);
        });
        this.todoListSelector.addEventListener('click', (e) => {
            this.handleCheckTodo(e);
        });
        this.filterPanel.addEventListener('click', this.handleFiltersTodo);
        this.completeAllBtn.addEventListener('click', this.handleCompleteAll);
        this.clearCompletedBtn.addEventListener('click', () => {
            this.handleClear();
        });
        this.todoListSelector.addEventListener('dblclick', (e) => {
            this.handleUpdateText(e, localStorage);
        });
    }
}