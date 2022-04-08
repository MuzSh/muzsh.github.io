#click Run to be amazed!
file = open("quotes.txt")
qte = []
for i in file:
    qte.append(i)
qteF = qte[Math.floor(Math.random() * file.length)]
print(qteF)