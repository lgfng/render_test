#ifndef __MYTYPES_H
#define __MYTYPES_H
#ifdef _WIN32
	#define timeb _timeb
	#define ftime _ftime
	#define open _open
	#define close _close
#endif

#ifndef VOID
#define VOID void
#endif
#define FAR far
//typedef unsigned char BYTE;
typedef unsigned short int uint16;
//typedef unsigned short int WORD;
//typedef unsigned int DWORD;
//typedef long LONG;

#ifdef _WIN32
	typedef unsigned int uint;
#endif

#endif
