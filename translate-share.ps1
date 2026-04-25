$c = Get-Content index.html -Raw -Encoding UTF8

# Share UI translations
$c = $c -replace 'Saving painting...', '保存画作... Saving...'
$c = $c -replace 'Painting saved!', '画作已保存! Painting saved!'
$c = $c -replace 'Your painting was saved in the following URL', '您的画作已保存到以下链接，您的作品可以继续创作或分享到社交媒体'
$c = $c -replace 'You can use it to continue your work later or to share your masterpiece in social media', 'You can use it to continue your work later or to share your masterpiece in social media / 您可以用它继续创作或分享到社交媒体'
$c = $c -replace 'COPY URL', '复制链接 COPY'

# Footer links
$c = $c -replace 'View source on Github', '查看源码 View source'

[System.IO.File]::WriteAllText('index.html', $c, [System.Text.Encoding]::UTF8)
Write-Host "Done: Translated share UI"