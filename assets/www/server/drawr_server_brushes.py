import Image
# http://effbot.org/imagingbook/introduction.htm

class BrushObj():
	def __init__(self, img, name, size, sized_images, type, loaded):
		self.img = img
		self.name = name
		self.size = size
		self.sized_images = sized_images
		self.type = type
		self.loaded = loaded

class DrawrBrushes():
    def __init__(self):
        self.brushes = []
        self.brush_names = ["circle","cathead","goblin","kappa","dota","custom"]
		self.brush_types = ["brush","stamp","stamp","stamp","stamp","stamp"]
		self.brush_variations = [10, 4, 6, 1, 102, 0]
        self.brush_sizes = [32, 16, 16, 32, 32, 16]
		
		self.size_variations = [1, 4, 8, 16, 32]
		self.loaded_count = 0

        for i in range(0, len(self.brush_names)):
			name = self.brush_name[i]
			for j in range(0, len(self.brush_variations[i])):
				type = self.brush_types[i]
				if type == "brush":
					sized_images = []
					brush_obj = BrushObj(None, name+j, 0, [], type, 1-len(self.size_variations))
					for k in range(0, len(self.size_variations)):
						size = self.size_variations[k]
						src = "brushes/"+name+"/"+j+"/"+size+".png" #brushes/circle/0/16.png
						temp_img = Image.open(src)
						sized_images.push(temp_img)
						



image.paste(something, (0,0,100,100))
