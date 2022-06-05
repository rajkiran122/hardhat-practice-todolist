//SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

contract TodoList {
    struct Todo {
        uint256 id;
        string title;
        bool completed;
        address user;
    }

    Todo[] public todos;
    uint256 public totalTodos;
    mapping(address => uint256) private userToNumberofTodos;

    modifier onlyOwner(uint256 _id) {
        Todo memory todo = todos[_id];
        require(todo.user == msg.sender, "You are not the owner of this todo!");
        _;
    }

    function addTask(string memory _title) public {
        Todo memory todo = Todo(totalTodos++, _title, false, msg.sender);
        todos.push(todo);
        userToNumberofTodos[msg.sender]++;
    }

    function toggleTaskCompleted(uint256 _id) public onlyOwner(_id) {
        Todo storage todo = todos[_id];
        todo.completed = !todo.completed;
    }

    function editTheTask(uint256 _id, string memory _title)
        public
        onlyOwner(_id)
    {
        Todo storage todo = todos[_id];
        require(todo.user == msg.sender, "You are not the owner of this todo!");
        todo.title = _title;
    }

    function getTheTask(uint256 _id)
        public
        view
        onlyOwner(_id)
        returns (Todo memory)
    {
        return todos[_id];
    }

    function getYourTasks() public view returns (Todo[] memory) {
        Todo[] memory _todos = new Todo[](userToNumberofTodos[msg.sender]);
        uint256 j;
        for (uint256 i = 0; i < totalTodos; i++) {
            if (todos[i].user == msg.sender) {
                _todos[j] = todos[i];
                j++;
            }
        }
        return _todos;
    }
}
