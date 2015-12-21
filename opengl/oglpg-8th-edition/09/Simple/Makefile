#! make

TARGETS = $(basename $(wildcard *.cpp))

LOAD_SHADERS.src = ../../lib/LoadShaders.cpp
LOAD_SHADERS.obj = LoadShaders.o

CXXOPTS =
CXXDEFS = 
CXXINCS = -I../../include

ifdef DEBUG
CXXDEFS += -DDEBUG
endif

CXXFLAGS = $(CXXOPTS) $(CXXDEFS) $(CXXINCS)

LDOPTS =
LDDIRS = -L../../lib
LDLIBS = -lglut -lGLEW -lGL -lGLU

LDFLAGS = $(LDOPTS) $(LDDIRS) $(LDLIBS)

DIRT = $(wildcard *~ *.o)

#-----------------------------------------------------------------------------

default all: $(TARGETS)

%: %.cpp $(LOAD_SHADERS.obj)
	$(CXX) $(CXXFLAGS) $^ $(LDFLAGS) -o $@

%.i: %.cpp
	$(CXX) $(CXXFLAGS) -E $< | uniq > $@

$(LOAD_SHADERS.obj): $(LOAD_SHADERS.src)
	$(CXX) $(CXXFLAGS) -c $(LOAD_SHADERS.src)

#-----------------------------------------------------------------------------

clean:
	$(RM) $(DIRT)

clobber: clean
	$(RM) $(TARGETS)

