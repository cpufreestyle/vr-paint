$c = Get-Content index.html -Raw -Encoding UTF8

# Tooltip translations
$c = $c -replace 'Brush size\\n\(slide up/down\)', '笔刷大小 Brush size\n(上下滑动 slide up/down)'
$c = $c -replace 'Brush size\\n\(up/down\)', '笔刷大小 Brush size\n(上下 up/down)'
$c = $c -replace 'Main menu', '主菜单 Main menu'
$c = $c -replace 'Main Menu', '主菜单 Main Menu'
$c = $c -replace 'Press to paint\\n\(pressure sensitive\)', '按压画画 Press to paint\n(压力感应 pressure sensitive)'
$c = $c -replace 'Press to paint!\\n\(pressure sensitive\)', '按压画画 Press to paint!\n(压力感应 pressure sensitive)'
$c = $c -replace 'Trigger to paint!', '触发画画 Trigger to paint!'
$c = $c -replace 'Undo', '撤销 Undo'
$c = $c -replace 'Teleport', '传送 Teleport'
$c = $c -replace 'Press to undo', '按压撤销 Press to undo'

# Title
$c = $c -replace '<title>A-Painter</title>', '<title>A-Painter / VR绘画</title>'
$c = $c -replace 'Paint in VR in your browser', 'VR绘画 / Paint in VR'

[System.IO.File]::WriteAllText('index.html', $c, [System.Text.Encoding]::UTF8)
Write-Host "Done: Translated tooltips and title"