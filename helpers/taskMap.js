const groupTasksByParentId = tasks => {
    const taskMap = {};
    tasks.forEach(task => {
      if (!taskMap[task.parentId]) {
        taskMap[task.parentId] = [];
      }
      taskMap[task.parentId].push(task);
    });
    return taskMap;
  };

  export default groupTasksByParentId;