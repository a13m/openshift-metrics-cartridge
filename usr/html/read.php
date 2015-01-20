<?php
# Security check
$security_arr = array('cgroup.procs',                                                                                                                                                                          
    'cpuacct.stat' => 'text',                                                                                                                                                                                  
    'cpuacct.usage' => 'counter',                                                                                                                                                                              
    'cpuacct.usage_percpu' => 'text',                                                                                                                                                                          
    'cpu.rt_period_us' => 'gauge',                                                                                                                                                                             
    'cpu.rt_runtime_us' => 'gauge',                                                                                                                                                                            
    'cpu.shares' => 'gauge',                                                                                                                                                                                   
    'freezer.state' => 'text',                                                                                                                                                                                 
    'memory.failcnt' => 'counter',                                                                                                                                                                             
    'memory.force_empty' => 'counter',                                                                                                                                                                         
    'memory.limit_in_bytes' => 'gauge',                                                                                                                                                                        
    'memory.max_usage_in_bytes' => 'gauge',                                                                                                                                                                    
    'memory.memsw.failcnt' => 'count',                                                                                                                                                                         
    'memory.memsw.limit_in_bytes' => 'gauge',                                                                                                                                                                  
    'memory.memsw.max_usage_in_bytes' => 'gauge',                                                                                                                                                              
    'memory.memsw.usage_in_bytes' => 'gauge',
    'memory.move_charge_at_immigrate' => 'counter',
    'memory.soft_limit_in_bytes' => 'gauge',
    'memory.stat' => 'text',
    'memory.swappiness' => 'gauge',
    'memory.usage_in_bytes' => 'gauge',
    'memory.use_hierarchy' => 'gauge',
    'net_cls.classid' => 'gauge',
    'notify_on_release' => 'gauge',
    'tasks' => 'text');

$item = $_GET['item'];

if($security_arr[$item]) {
    $value = shell_exec("/usr/bin/oo-cgroup-read $item");
    $arr = array('value' => trim($value), 'type' => $security_arr[$item]);
    echo json_encode($arr);
} else {
    $arr = array('value' => "N/A");
    echo json_encode($arr);
}
?>
