// Datos de ejemplo (solo se usan con ?dev=1). Provienen de los archivos Excel del cliente.
import {DIA,DS,SEM} from "./data.js";
const px=1; // placeholder para claridad
export const demo={
 c(v){Object.assign(v,{fecha:"2026-10-22",co_t:"1100",co_s:"2",co_e:"2028-08-04",no_t:"1500",no_s:"2",no_e:"2027-07-22",so2_t:"1100",so2_s:"2",so2_e:"2027-01-08",co2_t:"0",co2_s:"0",co2_e:"2026-10-19",no2_t:"1900",no2_s:"2",no2_e:"2027-10-08",h2_t:"1250",h2_s:"2",o2_t:"250",o2_s:"2",o2_e:"2028-07-21",c3_t:"1750",c3_s:"1.5",c3_e:"2028-07-26",n2_t:"1500",
  w2:"6.0",w7:"10118.8",w9:"180",w10:"180",w13:"1.2",w14:"2.0",w15:"4.5",w16:"5.5",w17:"220"});okAll(v)},
 p(v){Object.assign(v,{fecha:"2026-10-24",p_hac:"532-BP3",p_area:"Cemento L2",p_mat:"Clinker",p_tur:"2",p_marca:"Tersus",p_k:"1.0208",p_alt:"22 cm",p_cant:"10000",p_fcal:"2026-02-10",p_modelo:"INTECONT +",p_serie:"110227381-60A-CNTRL",p_res:"0,01 t/h",p_acc:"ver",
  p_ath_0:"126.43",p_ath_1:"126.64",p_ath_2:"126.24",p_ata_0:"17210",p_ata_1:"17210",p_ata_2:"17200",p_ane_0:"9780",p_ane_1:"9790",p_ane_2:"9800",p_arg_0:"10006",p_arg_1:"10001",p_arg_2:"10000",
  p_bth_0:"127.83",p_bta_0:"17200",p_bne_0:"10030",p_brg_0:"10000",p_obs:"ABW -2.35%.\nCW: 314.16.   KOR 1.0208\n50% de Salida"})},
 g(v){Object.assign(v,{fecha:"2026-10-19",g_r_o2z:"2.01",g_r_o2s:"20.96",g_r_tcz:"0.12",g_r_tcs:"15.8",g_r_so2:"149.8",g_r_co:"3045",g_r_no:"2498",g_r_co2:"26.03",g_ps_o2:"1900",g_ps_toc:"580",g_ps_so2:"1780",g_ps_co:"800",g_adz:"1",g_ads:"1"})},
 e(v){const rd=[4.72,8.53,13.85,17.51,18.25,25.6,23.9,24.3,22.5,23.4,23.5],o={fecha:"2026-05-25",e_hac:"TC.541MP2",e_pieza:"Motor C.A.",e_ubic:"Cemento L1",e_serie:"1234",e_pot:"600 W",e_rpm:"1787",e_volts:"460",e_amp:"703",e_aisl:"F",e_marca:"WH",e_prueba:"Variador",e_temp:"32",e_vtest:"500",e_l12:"103.2",e_l13:"102.1",e_l23:"102.8",e_na:"22",e_nf:"102",e_dd:"0"};rd.forEach((x,i)=>o["e_r_"+i]=String(x));Object.assign(v,o)},
 f(v){Object.assign(v,{fecha:"2026-11-05",f_hac:"531-DO1",f_mod:"AX123",f_rk:"0",f_rp:"0",f_z1:"60",f_z2:"6.6",f_z3:"0",f_z4:"0",f_nom:"208.17",f_si:"206.9",f_s1:"208.2",f_s2:"208.19",f_s3:"208.2",f_mink:"-15",f_maxk:"1",f_minp:"-1.5",f_maxp:"0.1",f_ri:"64511",f_rf:"64525",f_c1:"-0.8",f_c2:"-0.8",f_c3:"-0.8",f_fk:"0",f_fp:"0"})},
 a(v){Object.assign(v,{fecha:"2026-11-04",a_seg:"Cemento",a_reg:"México",a_uni:"Planta",a_sit:"Tecomán",a_pro:"Mantenimiento",a_are:"Eléctrico",a_equ:"Motor 531-MT1",a_hac:"531-MT1",a_des:"Cambio de motor en banda transportadora",a_n:"2",a_ne:"2",
  a_pa0:"Bloqueo y etiquetado",a_h0:["Energía eléctrica media tensión (de 1001 a 35000 Volts)","Trabajo en alturas"],a_co0:"LOTO, permiso de trabajo",a_s0_0:"4",a_q0_0:"3",a_s0_1:"3",a_q0_1:"2",a_ad0:"Supervisor presente",
  a_pa1:"Retiro del motor con grúa",a_h1:["Cargas suspendidas / levantamiento de cargas (con equipo)"],a_co1:"Maniobra dirigida",a_s1_0:"2",a_q1_0:"2",a_en0:"Juan Pérez",a_en1:"Luis Gómez",a_rn:"Ana Ruiz",a_rp:"Supervisor",a_an:"Carlos Soto",a_ap:"Gerente"})}
};

const anzDemo=(p,vals,obs)=>v=>{Object.assign(v,{fecha:"2026-11-07",[p+"_mreal"]:"si",[p+"_lt"]:"ok",
 [p+"_g_co_t"]:"1100",[p+"_g_co_s"]:"2",[p+"_g_co_e"]:"2028-08-04",[p+"_g_co_ini"]:"2546",[p+"_g_co_fin"]:"2418",
 [p+"_g_no_t"]:"1500",[p+"_g_no_s"]:"2",[p+"_g_no_e"]:"2027-07-22",[p+"_g_no_ini"]:"1917",[p+"_g_no_fin"]:"1806",
 [p+"_g_o2_t"]:"250",[p+"_g_o2_s"]:"2",[p+"_g_o2_e"]:"2028-07-21",[p+"_g_o2_z"]:"2.01",[p+"_g_o2_sp"]:"20.96",[p+"_g_n2_t"]:"1500"});
 const n=anzN[p];for(let i=0;i<n;i++)v[`${p}_s${i}`]="ok";Object.entries(vals).forEach(([i,x])=>v[`${p}_v${i}`]=x);Object.entries(obs).forEach(([i,x])=>v[`${p}_o${i}`]=x)};
const anzN={h:22,i:24};
demo.h=anzDemo("h",{16:"65",17:"4.8",18:"335",19:"618"},{7:"Filtro de piedra esta quebrado"});
demo.i=anzDemo("i",{20:"5.3",21:"345",22:"518"},{});
export function okAll(v){DIA.forEach((_,i)=>DS.forEach((_,j)=>v[`d${i}_${j}`]="ok"));SEM.forEach(([id,,ty])=>{if(ty==="ok")v[id]="ok"})}
