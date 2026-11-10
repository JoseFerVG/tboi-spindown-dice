import subprocess, time

start = time.time()
p = subprocess.Popen(
    ['C:/Program Files (x86)/Steam/steamapps/common/The Binding of Isaac Rebirth/tools/ResourceExtractor/ResourceExtractor.exe'],
    cwd='C:/Program Files (x86)/Steam/steamapps/common/The Binding of Isaac Rebirth/tools/ResourceExtractor',
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

stdout, stderr = p.communicate(input='\n\n', timeout=60)
print("Return code:", p.returncode)
print("Elapsed:", time.time() - start)
print("Stdout:", stdout[:500])
print("Stderr:", stderr[:500])
