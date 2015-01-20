$(function() {
  var active_mem, active_mem_data, addSwapData, cpu_data, cpu_opts, cpu_placeholder, cpu_time, curr_time, interval, item, mem_data, mem_opts, mem_placeholder, mem_stat, memory, memory_failcnt, memory_failcnt_node, memory_swap, memsw_data, memsw_failcnt, memsw_failcnt_node, pauseData, removeSwapData, showSection, static_items, tasks, updateCpuGraph, updateData, updateMemData, updateMemGraph, _i, _len;
  curr_time = (new Date).getTime();
  interval = null;
  /* App Info */
  ($('#app-info .static')).each(function() {
    return (new DataNode($(this), new DataItem(this.id))).update();
  });
  tasks = new DataNode($('#tasks'), new DataItem('tasks'));
  tasks.item.toString = function() {
    var string, task, task_arr, _i, _len;
    string = "<ul>";
    task_arr = this.value.split(' ');
    for (_i = 0, _len = task_arr.length; _i < _len; _i++) {
      task = task_arr[_i];
      string += "<li>" + task + "</li>";
    }
    return string += "</ul>";
  };
  /* CPU */
  cpu_time = new DataItem('cpuacct.usage');
  cpu_placeholder = $('#cpu-time .graph');
  cpu_opts = {
    lines: {
      show: true
    },
    points: {
      show: true
    },
    xaxis: {
      mode: 'time'
    },
    yaxis: {
      autoscaleMargin: 2
    }
  };
  cpu_data = [
    {
      label: 'Total CPU Time (ms)',
      data: []
    }
  ];
  updateCpuGraph = function() {
    cpu_data[0].data.push([curr_time, (parseFloat(cpu_time.value)) / 1000000]);
    if (cpu_data[0].data.length > MAX_DATA_POINTS) {
      cpu_data[0].data.shift();
    }
    return $.plot(cpu_placeholder, cpu_data, cpu_opts);
  };
  /* Memory */
  memory = new CompoundDataItem(new DataItem('memory.usage_in_bytes'), new DataItem('memory.max_usage_in_bytes'), new DataItem('memory.limit_in_bytes'));
  memory_swap = new CompoundDataItem(new DataItem('memory.memsw.usage_in_bytes'), new DataItem('memory.memsw.max_usage_in_bytes'), new DataItem('memory.memsw.limit_in_bytes'));
  active_mem = memory;
  static_items = [];
  ($('#text > div .static')).each(function() {
    return static_items.push(new DataNode($(this), new DataItem(this.id)));
  });
  for (_i = 0, _len = static_items.length; _i < _len; _i++) {
    item = static_items[_i];
    item.update();
  }
  memory_failcnt_node = $('#memory\\.failcnt');
  memsw_failcnt_node = $('#memory\\.memsw\\.failcnt');
  memsw_failcnt_node.hide();
  memory_failcnt = new DataNode(memory_failcnt_node, new DataItem('memory.failcnt'));
  memsw_failcnt = new DataNode(memsw_failcnt_node, new DataItem('memory.memsw.failcnt'));
  mem_stat = new DataNode($('#memory\\.stat'), new DataItem('memory.stat'));
  mem_placeholder = $('#memory .graph');
  mem_opts = {
    lines: {
      show: true,
      fill: .3
    },
    points: {
      show: true
    },
    xaxis: {
      mode: 'time'
    },
    yaxis: {
      min: 100,
      max: 500
    }
  };
  mem_data = [
    {
      label: 'Memory Limit (MiB)',
      data: []
    }, {
      label: 'Most Memory Used (MiB)',
      data: []
    }, {
      label: 'Memory Usage (MiB)',
      data: []
    }
  ];
  memsw_data = [
    {
      label: 'Memory + Swap Limit (MiB)',
      data: []
    }, {
      label: 'Most Memory + Swap Used (MiB)',
      data: []
    }, {
      label: 'Memory + Swap Usage (MiB)',
      data: []
    }
  ];
  active_mem_data = mem_data;
  updateMemGraph = function() {
    var valMiB;
    valMiB = (parseFloat(this.value)) / 1048576;
    switch (this.item) {
      case 'memory.usage_in_bytes':
        updateMemData(mem_data[2].data, valMiB);
        if (mem_opts.yaxis.min > valMiB) {
          mem_opts.yaxis.min = valMiB - 50;
        }
        break;
      case 'memory.max_usage_in_bytes':
        updateMemData(mem_data[1].data, valMiB);
        break;
      case 'memory.limit_in_bytes':
        updateMemData(mem_data[0].data, valMiB);
        mem_opts.yaxis.max = valMiB + 20;
        break;
      case 'memory.memsw.usage_in_bytes':
        updateMemData(memsw_data[2].data, valMiB);
        if (mem_opts.yaxis.min > valMiB) {
          mem_opts.yaxis.min = valMiB - 50;
        }
        break;
      case 'memory.memsw.max_usage_in_bytes':
        updateMemData(memsw_data[1].data, valMiB);
        break;
      case 'memory.memsw.limit_in_bytes':
        updateMemData(memsw_data[0].data, valMiB);
        mem_opts.yaxis.max = valMiB + 20;
    }
    return $.plot(mem_placeholder, active_mem_data, mem_opts);
  };
  updateMemData = function(data, value) {
    data.push([curr_time, value]);
    if (data.length > MAX_DATA_POINTS) {
      return data.shift();
    }
  };
  addSwapData = function() {
    active_mem = memory_swap;
    active_mem_data = memsw_data;
    memory_failcnt_node.hide();
    return memsw_failcnt_node.show();
  };
  removeSwapData = function() {
    active_mem = memory;
    active_mem_data = mem_data;
    memsw_failcnt_node.hide();
    return memory_failcnt_node.show();
  };
  updateData = function() {
    return interval = setInterval((function() {
      curr_time = (new Date).getTime();
      cpu_time.update(updateCpuGraph, null, this);
      active_mem.update(updateMemGraph, null, null);
      tasks.update();
      memory_failcnt.update();
      memsw_failcnt.update();
      return mem_stat.update();
    }), POLL_INTERVAL);
  };
  pauseData = function() {
    return clearInterval(interval);
  };
  showSection = function(event) {
    var targetSection;
    targetSection = ($(event.target)).closest('section');
    if (targetSection.hasClass('hidden')) {
      ($('body > section')).addClass('hidden');
      return targetSection.removeClass('hidden');
    }
  };
  ($('section h1')).click(showSection);
  ($('#swap')).click(function(event) {
    var $this;
    event.preventDefault();
    $this = $(this);
    if ($this.hasClass('on')) {
      ($this.removeClass('on')).text('Add swap data');
      ($('#failcnt h3')).text('Times memory limit reached');
      return removeSwapData();
    } else {
      ($this.addClass('on')).text('Remove swap data');
      ($('#failcnt h3')).text('Times memory + swap limit reached');
      return addSwapData();
    }
  });
  ($('#pause')).click(function(event) {
    var $this;
    console.log('pause clicked!');
    event.preventDefault();
    $this = $(this);
    if ($this.hasClass('paused')) {
      ($this.removeClass('paused')).text('Pause data updates');
      return updateData();
    } else {
      ($this.addClass('paused')).text('Resume data updates');
      return pauseData();
    }
  });
  return updateData();
});