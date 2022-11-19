import time
class vars:
    time_left = 45

def presentBonus(num):
    vars.time_left-=1
    print(f"Time Left: {vars.time_left} Minutes")

while vars.time_left >30:
    presentBonus(vars.time_left)
    time.sleep(60)