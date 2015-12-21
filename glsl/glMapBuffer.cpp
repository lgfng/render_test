GLuint  buffer;
FILE    * f;
size_t  filesize;

f = fopen("data.dat", "rb");
fseek(f, 0, SEEK_END);
filesize = ftell(f);
fseek(f, 0, SEEK_SET);

glGenBuffers(1, &buffer);
glBindBuffer(GL_COPY_WRITE_BUFFER, buffer);

glBufferData(GL_COPY_WRITE_BUFFER, GL_WRITE_ONLY);
fread(data, 1, filesize, f);

glUnmapBuffer(GL_COPY_WRITE_BUFFER);
fclose(f);
