/* dither rgb to 256-color example 
argv: <input bmp filename> <output png filename>
   --pclion by 2002-2-25
*/

//#ifdef _WIN32
//	#include <windows.h>
//#else
#include <stdio.h>
#include <malloc.h>

#include <sys/timeb.h>
#include <stdlib.h>
#include "windef.h"
	#include "mytypes.h"
	#include "bitmap.h"
//#endif
#include "png.h"
#include "dither.h"

extern unsigned char colormap[216][3];

int writepng(png_bytep pngbuf, png_uint_32 length, 
			 int width, int height, int bit_depth,
			 int color_type, int interlace_type,
			 png_colorp palette, int num_palette, int trans, int bgcolor,
			 png_bytepp row_pointers);

int getFileSize(FILE *fp) 
{
	int ret;

	fseek(fp,0L,SEEK_END);
	ret = ftell(fp);
	fseek(fp,0L,SEEK_SET);
	return ret;
}
// This is just a generic function to read a file into a memory block.
int read_bmp_to_mem(char *bmpfn,unsigned char **bmppp, DWORD *fsizep)
{
	FILE *hfile;
	DWORD fsize;
	unsigned char *fbuf;

	hfile=fopen(bmpfn,"rb");
	if(hfile==NULL) return 1;

	fsize=getFileSize(hfile);
	if(fsize>0) {
		fbuf=(unsigned char*)malloc(fsize);
		if(fbuf) {
			if(fread((void*)fbuf,1,fsize,hfile) == fsize) {
					(*bmppp)  = fbuf;
					(*fsizep) = fsize;
					fclose(hfile);
					return 0;   // success
				}
			free((void*)fbuf);
		}
	}
	fclose(hfile);
	return 1;  // error
}

int main(int argc,char **argv)
{
	char *bmpfn,*pngfn;
	unsigned char *bmpp;
	DWORD bmpsize;
	LPBITMAPINFOHEADER lpbmih;
	BYTE *outimage;
	int height,width,bytesperline;
	int pnglen,bit_depth;
	png_bytep pngbuf,p;
	png_bytepp row_pointers;
	int topdown;
	int i;
	FILE *fp;
struct timeb  start, finish;
int d;

	if(argc!=3) {
		printf("Usage: %s <file.bmp> <file.png>\n",argv[0]);
		return 1;
	}
	bmpfn=argv[1];
	pngfn=argv[2];


	if(read_bmp_to_mem(bmpfn,&bmpp, &bmpsize)) {
		printf("can't read BMP from file\n");
		return 1;
	}

	lpbmih = (LPBITMAPINFOHEADER)&bmpp[14];
	if (lpbmih->biBitCount !=24) {
		printf("not 24bit format!\n");
		exit(1);
	}
	if (lpbmih->biCompression !=0) {
		printf("not support RLE\n");
		exit(1);
	}

	bytesperline = (3*lpbmih->biWidth +3) & ~3;
	if (lpbmih->biHeight < 0) {
		height = -lpbmih->biHeight;
		topdown = 1;
	}
	else {
		height = lpbmih->biHeight;
		topdown = 0;
	}
	width = lpbmih->biWidth;
	if (width>2046) {
		printf("i can't process width>2046 pixels\n");
		exit(1);
	}
	outimage = (BYTE*)malloc(height*width);
	if (outimage==NULL) {
		printf("no memeory\n");
		exit(1);
	}

	ftime( &start );
// dither for bmp 24bit to 8bit palette
	dither(&bmpp[54], width, height, bytesperline, outimage);

	ftime( &finish );
	d = finish.time*1000 + finish.millitm - (start.time*1000 + start.millitm);
	printf("dither time: %d ms\n",d);


	free(bmpp);
	pnglen = height*width+1024;
	pngbuf = (png_bytep)malloc(pnglen);
	bit_depth = 8;
	row_pointers = (png_bytepp)calloc(height,sizeof(png_bytep));
	if (topdown) {
		for (p=outimage, i=0;i<height;i++, p += width)
			row_pointers[i] = p;
		}
	else {
		for (p=outimage, i=height-1;i>=0;i--, p += width)
			row_pointers[i] = p;
		}


	i = writepng(pngbuf, pnglen, width, height, bit_depth,
		 PNG_COLOR_TYPE_PALETTE, PNG_INTERLACE_NONE,
		 (png_colorp) colormap, 216, -1, -1,
		 row_pointers);
	

	ftime( &finish );
	d = finish.time*1000 + finish.millitm - (start.time*1000 + start.millitm);
	printf("conversion time: %d ms\n",d);

	if (i==-1) {
		printf("transform to png error\n");
		exit(1);
	}
	fp = fopen(pngfn,"wb");
	if (fp==NULL) {
		printf("error create file %s\n",pngfn);
		exit(1);
	}
	fwrite(pngbuf,1,i,fp);
	fclose(fp);

	free(outimage);
	free(pngbuf);
	free(row_pointers);

	return 0;
}
