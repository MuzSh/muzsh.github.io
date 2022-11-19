import cv2 as cv
import numpy as np

img = np.zeros((600, 900, 3), dtype=np.uint8)

#skies
cv.rectange(img, (0,0),(900,500), (255,225, 85), -1)
cv.imshow("tree", img)

cv.waitKey(0)
cv.destroyAllWindows()
