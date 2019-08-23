#-------------------------------------------------
#
# Project created by QtCreator 2019-08-21T16:13:59
#
#-------------------------------------------------

QT       += core gui network

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TARGET = wiki-image-thumbnailer
TEMPLATE = app

SOURCES += main.cpp\
           mainwindow.cpp \
           image_display.cpp

HEADERS  += mainwindow.h \
            image_display.h

FORMS    += mainwindow.ui

# For GCC/Clang/MinGW.
QMAKE_CXXFLAGS += -g
QMAKE_CXXFLAGS += -O2
QMAKE_CXXFLAGS += -Wall
QMAKE_CXXFLAGS += -pipe
QMAKE_CXXFLAGS += -pedantic
QMAKE_CXXFLAGS += -std=c++11
