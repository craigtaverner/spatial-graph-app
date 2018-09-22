/****************************************************************************
 ** @license
 ** This file is part of yFiles for HTML 2.1.0.4.
 ** 
 ** yWorks proprietary/confidential. Use is subject to license terms.
 **
 ** Copyright (c) 2018 by yWorks GmbH, Vor dem Kreuzberg 28, 
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ***************************************************************************/

/* eslint-disable */
import y from'./core.js';import l from'./lang.js';import'./algorithms.js';import'./layout-orthogonal.js';import'./router-polyline.js';import'./router-other.js';import'./layout-tree.js';import'./layout-core.js';(function(a,b,c,d){'use strict';b.lang.addMappings('yFiles-for-HTML-Complete-2.1.0.4-Evaluation (Build 83c4cd2e1db0-09/12/2018)',{_$_zqd:['aspectRatio','$ga'],_$_ard:['gridSpacing','$ha'],_$_pyl:['CompactOrthogonalLayout','VFC'],_$$_ioa:['yfiles.orthogonal','yfiles._R.T','yfiles._R.C']});var e=['Illegal value for grid size: ','Aspect ratio must be greater than zero: '];b.lang.module('_$$_ioa',function(c){c._$_pyl=new b.lang.ClassDefinition(function(){return{$extends:a.C.XFC,constructor:function(){a.C.XFC.call(this);var b=new a.T.XFC.T2(0,a.WE.$f4);this.$AlT=b;var c=new a.C.UFC;c.$RAT=!0,c.$DW=3,this.$Ap=c;var d=new a.T.XFC.T1(null);this.$BlT=d,this.$zlT=a.ANA.$m(null),this.$ga=1,this.$ha=20},$f:0,$f1:0,$f5:0,$f6:0,_$_ard:{get:function(){return this.$f1},set:function(b){if(b<1)throw a.PE.$m18(e[0]+b);if(this.$f1=b,this.$Ap instanceof a.C.UFC){this.$Ap.$ia=b}if(this.$BlT instanceof a.T.XFC.T1){var c=this.$BlT;c.$f.$knT=2*b,c.$f.$Wa=b}var d=this.$zlT;if(d instanceof a.T.XFC.T){d.$f.$eI=new a.C.MGC(0,0,b)}else d instanceof a.BNA&&(d.$f=0.125)}},_$_zqd:{get:function(){return this.$f},set:function(b){if(b<=0)throw a.PE.$m18(e[1]+b);if(this.$f=b,this.$BlT instanceof a.T.XFC.T1){this.$BlT.$f.$WfT=new a.C.FRA(b,1)}this.$zlT instanceof a.BNA&&(this.$zlT.$f=0.125)}}}})})}(y.lang.module('yfiles._R'),y));export var CompactOrthogonalLayout=y.orthogonal.CompactOrthogonalLayout;export default y;
