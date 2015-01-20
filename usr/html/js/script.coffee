
$ ->
  # Initialize some variables
  curr_time = (new Date).getTime()
  interval = null
  
  ### App Info ###
  
  ($ '#app-info .static').each ->
    (new DataNode ($ this), new DataItem this.id).update()
  # Tasks
  tasks = new DataNode ($ '#tasks'), new DataItem 'tasks'
  # Change toString to make a list
  tasks.item.toString = ->
    string = "<ul>"
    task_arr = this.value.split(' ')
    string += "<li>#{task}</li>" for task in task_arr
    string += "</ul>"
    
  ### CPU ###
  
  cpu_time = new DataItem 'cpuacct.usage'
  cpu_placeholder = $ '#cpu-time .graph'
  cpu_opts =  lines:
                show: true
              points:
                show: true
              xaxis:
                mode: 'time'
              yaxis:
                autoscaleMargin: 2
                
  cpu_data = [
    label:
      'Total CPU Time (ms)'
    data: []
  ]
  
  updateCpuGraph = ->
    #Update data set
    cpu_data[0].data.push [curr_time, (parseFloat cpu_time.value)/1000000]
    # Check for data set size
    if cpu_data[0].data.length > MAX_DATA_POINTS
      cpu_data[0].data.shift()
    $.plot cpu_placeholder, cpu_data, cpu_opts
  
  ### Memory ###
  
  memory = new CompoundDataItem (new DataItem 'memory.usage_in_bytes'),
                                (new DataItem 'memory.max_usage_in_bytes'),
                                (new DataItem 'memory.limit_in_bytes')
  
  memory_swap = new CompoundDataItem (new DataItem 'memory.memsw.usage_in_bytes'),
                                     (new DataItem 'memory.memsw.max_usage_in_bytes'),
                                     (new DataItem 'memory.memsw.limit_in_bytes')
  
  # memory is active by default
  active_mem = memory
  
  # text memory items
  # update static items once
  static_items = []
  ($ '#text > div .static').each ->
    static_items.push new DataNode ($ this), (new DataItem this.id)

  # Update all the static items
  item.update() for item in static_items
  
  # failcounts are dynamic text data
  memory_failcnt_node = $ '#memory\\.failcnt'
  memsw_failcnt_node = $ '#memory\\.memsw\\.failcnt'
  memsw_failcnt_node.hide() # memsw_failcnt is hidden by default
  memory_failcnt = new DataNode memory_failcnt_node, new DataItem 'memory.failcnt'
  memsw_failcnt = new DataNode memsw_failcnt_node, new DataItem 'memory.memsw.failcnt'
  
  # memory.stat is also dynamic
  mem_stat = new DataNode ($ '#memory\\.stat'), new DataItem 'memory.stat'
  
  # memory graph
  mem_placeholder = $ '#memory .graph'
  mem_opts =  lines:
                show: true
                fill: .3
              points:
                show: true
              xaxis:
                mode: 'time'
              yaxis:
                min: 100
                max: 500
                
              
  mem_data = [
    {
      label: 'Memory Limit (MiB)'
      data: []
    }
    {
      label: 'Most Memory Used (MiB)'
      data: []
    }
    {
      label: 'Memory Usage (MiB)'
      data: []
    }]
  # Initialize memsw_data similarly to mem_data
  memsw_data = [
    {
      label: 'Memory + Swap Limit (MiB)'
      data: []
    }
    {
      label: 'Most Memory + Swap Used (MiB)'
      data: []
    }
    {
      label: 'Memory + Swap Usage (MiB)'
      data: []
    }]
  
  active_mem_data = mem_data
  
  updateMemGraph = ->
    # Adjust value to MiB
    valMiB = (parseFloat this.value)/1048576
    # Get correct data array
    switch this.item
      when 'memory.usage_in_bytes'
        updateMemData mem_data[2].data, valMiB
        # Update yaxis if needed
        if mem_opts.yaxis.min > valMiB
          mem_opts.yaxis.min = valMiB - 50
      when 'memory.max_usage_in_bytes'
        updateMemData mem_data[1].data, valMiB
      when 'memory.limit_in_bytes'
        updateMemData mem_data[0].data, valMiB
        # update yaxis max
        mem_opts.yaxis.max = valMiB + 20
      when 'memory.memsw.usage_in_bytes'
        updateMemData memsw_data[2].data, valMiB
        if mem_opts.yaxis.min > valMiB
          mem_opts.yaxis.min = valMiB - 50
      when 'memory.memsw.max_usage_in_bytes'
        updateMemData memsw_data[1].data, valMiB
      when 'memory.memsw.limit_in_bytes'
        updateMemData memsw_data[0].data, valMiB
        # update yaxis max
        mem_opts.yaxis.max = valMiB + 20
    
    # Update graph
    $.plot mem_placeholder, active_mem_data, mem_opts
  
  updateMemData = (data, value) ->
    # Add data point / convert from bytes to KiB
    data.push [curr_time, value]
    
    # Keep number of data points sane
    if data.length > MAX_DATA_POINTS
      data.shift()
      
    
  # Change memory graph to use memory + swap data (memory.memsw.*)
  addSwapData = ->
    # Change active memory object
    active_mem = memory_swap
    active_mem_data = memsw_data
    # Change visibility of fail count
    memory_failcnt_node.hide()
    memsw_failcnt_node.show()
  
  # Change memory graph to only use memory data and not swap
  removeSwapData = ->
    # Change active memory object
    active_mem = memory
    active_mem_data = mem_data
    # Change visibility of fail count
    memsw_failcnt_node.hide()
    memory_failcnt_node.show()

  updateData = ->
    # Update at interval
    interval = setInterval ( ->
      curr_time = (new Date).getTime()
      cpu_time.update updateCpuGraph,
        null,
        this
      active_mem.update updateMemGraph,
        null,
        null
      tasks.update()
      memory_failcnt.update()
      memsw_failcnt.update()
      mem_stat.update()
      ),
      POLL_INTERVAL
  
  pauseData = ->
    clearInterval interval
  
  showSection = (event) ->
    targetSection = ($ event.target).closest 'section'
    if targetSection.hasClass 'hidden'
      ($ 'body > section').addClass 'hidden'
      targetSection.removeClass 'hidden'
    
  # Show/hide sections
  ($ 'section h1').click showSection
  
  # Swap button event
  ($ '#swap').click (event) ->
    event.preventDefault()
    $this = $ this
    if $this.hasClass 'on'
      # Swap is currently on, so turn it off
      ($this.removeClass 'on').text 'Add swap data'
      ($ '#failcnt h3').text 'Times memory limit reached'
      removeSwapData()
    else
      # Swap is currently off, so turn it on
      ($this.addClass 'on').text 'Remove swap data'
      ($ '#failcnt h3').text 'Times memory + swap limit reached'
      addSwapData()
  
  # Pause button
  ($ '#pause').click (event) ->
    console.log 'pause clicked!'
    event.preventDefault()
    $this = $ this
    if $this.hasClass 'paused'
      # Data is paused, so resume
      ($this.removeClass 'paused').text 'Pause data updates'
      updateData()
    else
      # Data is updating so pause
      ($this.addClass 'paused').text 'Resume data updates'
      pauseData()
  
  # Start updating data
  updateData()
  