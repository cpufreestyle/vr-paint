import re
script_dir = r'C:\Users\michael\.qclaw\workspace\vr-paint-original'
with open(script_dir + '\\index.html', 'r', encoding='utf-8') as f:
    c = f.read()

css_addition = '''
<style>
#mode-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  background: #222;
  color: #fff;
  border: 2px solid #4CAF50;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 8px;
  font-family: sans-serif;
}
#mode-toggle:hover { background: #4CAF50; }
</style>
'''

button_html = '''
<button id="mode-toggle" onclick="toggleVRMode()">切换到VR模式</button>
<script>
function toggleVRMode() {
  var btn = document.getElementById('mode-toggle');
  var scene = document.querySelector('a-scene');
  if (scene) {
    var isVR = scene.getAttribute('vr-mode');
    if (isVR === 'true') {
      scene.setAttribute('vr-mode', 'false');
      btn.textContent = '切换到VR模式';
      btn.style.background = '#222';
    } else {
      scene.setAttribute('vr-mode', 'true');
      btn.textContent = '切换到触屏模式';
      btn.style.background = '#4CAF50';
    }
  }
}
</script>
'''

c = c.replace('</head>', css_addition + '</head>')
c = c.replace('</body>', button_html + '</body>')

with open('index.html','w',encoding='utf-8') as f:
    f.write(c)
print('Done')