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
		self.selected_brush = 0
		self.brush_size = 0

        for i in range(0, len(self.brush_names)):
			name = self.brush_name[i]
			for j in range(0, len(self.brush_variations[i])):
				type = self.brush_types[i]
				if type == "brush":
					sized_images = []
					brush_obj = BrushObj(None, name+j, 0, [], type, 1-len(self.size_variations))
					for k in range(0, len(self.size_variations)):
						size = self.size_variations[k]
						src = "brushes/"+name+"/"+str(j)+"/"+size+".png" #brushes/circle/0/16.png
						try:
							temp_img = Image.open(src)
							sized_images.push(temp_img)
							brush_obj.loaded += 1
							if brush_obj.loaded == 1:
								self.loaded_count += 1
								if self.loaded_count == len(self.brush_names):
									onload_continuation()
						except IOError: pass
					brush_obj.sized_images = sized_images
					self.brushes.push(brush_obj)
				elif type == "stamp":
					src = "brushes/"+name+"/"+str(j)+".png"
					try:
						temp_img = Image.open(src)
						brush_obj = BrushObj(temp_img, name+str(j), self.brush_sizes[i], None, type, 1)
						self.loaded_count += 1
						self.brushes.push(brush_obj)
						if self.loaded_count == len(self.brush_names):
							onload_continuation()
					except IOError: pass
	
	def getBrushes(self):
		return self.brushes
		
	def getBrushNames(self):
		return self.brush_names
		
	def selectBrush(self, brush):
		try: #if brush by number
			self.selected_brush = int(brush)
			return self.selected_brush
		except:
			for i in range(0, len(self.brushes)):
				if self.brushes[i].name == brush:
					self.selected_brush = i
					return self.selected_brush
			self.selected_brush = 0
			return self.selected_brush

	def getBrush(self):
		return self.brushes[self.selected_brush]
		
	def setBrushSize(self, size):
		self.brush_size = size
		
	def getBrushSize(self):
		return self.brush_size

image.paste(something, (0,0,100,100))
