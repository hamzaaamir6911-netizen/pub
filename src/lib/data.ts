import type { Item, Customer, Sale, Expense } from '@/lib/types';

export const mockItems: Item[] = [
  { id: 'ITM1001', name: 'D10 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 380, salePrice: 406, color: 'Dull', weight: 0.124 },
  { id: 'ITM1002', name: 'D10 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 380, salePrice: 408, color: 'H23/PC-RAL', weight: 0.124 },
  { id: 'ITM1003', name: 'D10 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 380, salePrice: 437, color: 'Sahra/BRN', weight: 0.124 },
  { id: 'ITM1004', name: 'D10 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 380, salePrice: 457, color: 'Black/Multi', weight: 0.124 },
  { id: 'ITM1005', name: 'D10 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 380, salePrice: 510, color: 'Wood Coat', weight: 0.124 },
  { id: 'ITM1006', name: 'D10 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 480, salePrice: 509, color: 'Dull', weight: 0.165 },
  { id: 'ITM1007', name: 'D10 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 480, salePrice: 511, color: 'H23/PC-RAL', weight: 0.165 },
  { id: 'ITM1008', name: 'D10 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 480, salePrice: 547, color: 'Sahra/BRN', weight: 0.165 },
  { id: 'ITM1009', name: 'D10 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 480, salePrice: 572, color: 'Black/Multi', weight: 0.165 },
  { id: 'ITM1010', name: 'D10 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 480, salePrice: 639, color: 'Wood Coat', weight: 0.165 },
  { id: 'ITM1011', name: 'D10 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 600, salePrice: 628, color: 'Dull', weight: 0.208 },
  { id: 'ITM1012', name: 'D10 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 600, salePrice: 630, color: 'H23/PC-RAL', weight: 0.208 },
  { id: 'ITM1013', name: 'D10 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 600, salePrice: 674, color: 'Sahra/BRN', weight: 0.208 },
  { id: 'ITM1014', name: 'D10 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 600, salePrice: 706, color: 'Black/Multi', weight: 0.208 },
  { id: 'ITM1015', name: 'D10 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 600, salePrice: 788, color: 'Wood Coat', weight: 0.208 },
  { id: 'ITM1016', name: 'D10A (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 540, salePrice: 573, color: 'Dull', weight: 0.19 },
  { id: 'ITM1017', name: 'D10A (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 540, salePrice: 575, color: 'H23/PC-RAL', weight: 0.19 },
  { id: 'ITM1018', name: 'D10A (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 540, salePrice: 615, color: 'Sahra/BRN', weight: 0.19 },
  { id: 'ITM1019', name: 'D10A (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 540, salePrice: 644, color: 'Black/Multi', weight: 0.19 },
  { id: 'ITM1020', name: 'D10A (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 540, salePrice: 719, color: 'Wood Coat', weight: 0.19 },
  { id: 'ITM1021', name: 'D10A (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 670, salePrice: 705, color: 'Dull', weight: 0.237 },
  { id: 'ITM1022', name: 'D10A (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 670, salePrice: 707, color: 'H23/PC-RAL', weight: 0.237 },
  { id: 'ITM1023', name: 'D10A (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 670, salePrice: 756, color: 'Sahra/BRN', weight: 0.237 },
  { id: 'ITM1024', name: 'D10A (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 670, salePrice: 792, color: 'Black/Multi', weight: 0.237 },
  { id: 'ITM1025', name: 'D10A (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 670, salePrice: 884, color: 'Wood Coat', weight: 0.237 },
  { id: 'ITM1026', name: 'D11 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 170, salePrice: 181, color: 'Dull', weight: 0.057 },
  { id: 'ITM1027', name: 'D11 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 170, salePrice: 182, color: 'H23/PC-RAL', weight: 0.057 },
  { id: 'ITM1028', name: 'D11 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 170, salePrice: 195, color: 'Sahra/BRN', weight: 0.057 },
  { id: 'ITM1029', name: 'D11 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 170, salePrice: 204, color: 'Black/Multi', weight: 0.057 },
  { id: 'ITM1030', name: 'D11 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 170, salePrice: 228, color: 'Wood Coat', weight: 0.057 },
  { id: 'ITM1031', name: 'D14 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 260, salePrice: 277, color: 'Dull', weight: 0.09 },
  { id: 'ITM1032', name: 'D14 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 260, salePrice: 279, color: 'H23/PC-RAL', weight: 0.09 },
  { id: 'ITM1033', name: 'D14 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 260, salePrice: 299, color: 'Sahra/BRN', weight: 0.09 },
  { id: 'ITM1034', name: 'D14 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 260, salePrice: 312, color: 'Black/Multi', weight: 0.09 },
  { id: 'ITM1035', name: 'D14 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 260, salePrice: 349, color: 'Wood Coat', weight: 0.09 },
  { id: 'ITM1036', name: 'D15 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 165, salePrice: 177, color: 'Dull', weight: 0.056 },
  { id: 'ITM1037', name: 'D15 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 165, salePrice: 179, color: 'H23/PC-RAL', weight: 0.056 },
  { id: 'ITM1038', name: 'D15 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 165, salePrice: 192, color: 'Sahra/BRN', weight: 0.056 },
  { id: 'ITM1039', name: 'D15 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 165, salePrice: 200, color: 'Black/Multi', weight: 0.056 },
  { id: 'ITM1040', name: 'D15 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 165, salePrice: 224, color: 'Wood Coat', weight: 0.056 },
  { id: 'ITM1041', name: 'D16 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 440, salePrice: 466, color: 'Dull', weight: 0.155 },
  { id: 'ITM1042', name: 'D16 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 440, salePrice: 468, color: 'H23/PC-RAL', weight: 0.155 },
  { id: 'ITM1043', name: 'D16 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 440, salePrice: 501, color: 'Sahra/BRN', weight: 0.155 },
  { id: 'ITM1044', name: 'D16 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 440, salePrice: 524, color: 'Black/Multi', weight: 0.155 },
  { id: 'ITM1045', name: 'D16 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 440, salePrice: 585, color: 'Wood Coat', weight: 0.155 },
  { id: 'ITM1046', name: 'D16 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 510, salePrice: 538, color: 'Dull', weight: 0.18 },
  { id: 'ITM1047', name: 'D16 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 510, salePrice: 540, color: 'H23/PC-RAL', weight: 0.18 },
  { id: 'ITM1048', name: 'D16 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 510, salePrice: 578, color: 'Sahra/BRN', weight: 0.18 },
  { id: 'ITM1049', name: 'D16 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 510, salePrice: 605, color: 'Black/Multi', weight: 0.18 },
  { id: 'ITM1050', name: 'D16 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 510, salePrice: 675, color: 'Wood Coat', weight: 0.18 },
  { id: 'ITM1051', name: 'D16 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 630, salePrice: 659, color: 'Dull', weight: 0.22 },
  { id: 'ITM1052', name: 'D16 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 630, salePrice: 661, color: 'H23/PC-RAL', weight: 0.22 },
  { id: 'ITM1053', name: 'D16 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 630, salePrice: 707, color: 'Sahra/BRN', weight: 0.22 },
  { id: 'ITM1054', name: 'D16 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 630, salePrice: 740, color: 'Black/Multi', weight: 0.22 },
  { id: 'ITM1055', name: 'D16 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 630, salePrice: 826, color: 'Wood Coat', weight: 0.22 },
  { id: 'ITM1056', name: 'D18 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 470, salePrice: 495, color: 'Dull', weight: 0.165 },
  { id: 'ITM1057', name: 'D18 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 470, salePrice: 497, color: 'H23/PC-RAL', weight: 0.165 },
  { id: 'ITM1058', name: 'D18 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 470, salePrice: 532, color: 'Sahra/BRN', weight: 0.165 },
  { id: 'ITM1059', name: 'D18 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 470, salePrice: 557, color: 'Black/Multi', weight: 0.165 },
  { id: 'ITM1060', name: 'D18 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 470, salePrice: 621, color: 'Wood Coat', weight: 0.165 },
  { id: 'ITM1061', name: 'D18 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 610, salePrice: 642, color: 'Dull', weight: 0.213 },
  { id: 'ITM1062', name: 'D18 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 610, salePrice: 644, color: 'H23/PC-RAL', weight: 0.213 },
  { id: 'ITM1063', name: 'D18 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 610, salePrice: 689, color: 'Sahra/BRN', weight: 0.213 },
  { id: 'ITM1064', name: 'D18 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 610, salePrice: 721, color: 'Black/Multi', weight: 0.213 },
  { id: 'ITM1065', name: 'D18 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 610, salePrice: 805, color: 'Wood Coat', weight: 0.213 },
  { id: 'ITM1066', name: 'D18 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 760, salePrice: 803, color: 'Dull', weight: 0.267 },
  { id: 'ITM1067', name: 'D18 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 760, salePrice: 805, color: 'H23/PC-RAL', weight: 0.267 },
  { id: 'ITM1068', name: 'D18 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 760, salePrice: 861, color: 'Sahra/BRN', weight: 0.267 },
  { id: 'ITM1069', name: 'D18 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 760, salePrice: 902, color: 'Black/Multi', weight: 0.267 },
  { id: 'ITM1070', name: 'D18 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 760, salePrice: 1006, color: 'Wood Coat', weight: 0.267 },
  { id: 'ITM1071', name: 'D20 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 490, salePrice: 520, color: 'Dull', weight: 0.173 },
  { id: 'ITM1072', name: 'D20 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 490, salePrice: 522, color: 'H23/PC-RAL', weight: 0.173 },
  { id: 'ITM1073', name: 'D20 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 490, salePrice: 559, color: 'Sahra/BRN', weight: 0.173 },
  { id: 'ITM1074', name: 'D20 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 490, salePrice: 585, color: 'Black/Multi', weight: 0.173 },
  { id: 'ITM1075', name: 'D20 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 490, salePrice: 653, color: 'Wood Coat', weight: 0.173 },
  { id: 'ITM1076', name: 'D29/D29D/EM29 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 215, color: 'Dull', weight: 0.07 },
  { id: 'ITM1077', name: 'D29/D29D/EM29 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 216, color: 'H23/PC-RAL', weight: 0.07 },
  { id: 'ITM1078', name: 'D29/D29D/EM29 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 231, color: 'Sahra/BRN', weight: 0.07 },
  { id: 'ITM1079', name: 'D29/D29D/EM29 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 242, color: 'Black/Multi', weight: 0.07 },
  { id: 'ITM1080', name: 'D29/D29D/EM29 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 270, color: 'Wood Coat', weight: 0.07 },
  { id: 'ITM1081', name: 'D29A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 245, salePrice: 260, color: 'Dull', weight: 0.085 },
  { id: 'ITM1082', name: 'D29A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 245, salePrice: 261, color: 'H23/PC-RAL', weight: 0.085 },
  { id: 'ITM1083', name: 'D29A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 245, salePrice: 279, color: 'Sahra/BRN', weight: 0.085 },
  { id: 'ITM1084', name: 'D29A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 245, salePrice: 292, color: 'Black/Multi', weight: 0.085 },
  { id: 'ITM1085', name: 'D29A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 245, salePrice: 326, color: 'Wood Coat', weight: 0.085 },
  { id: 'ITM1086', name: 'D29B (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 125, salePrice: 133, color: 'Dull', weight: 0.04 },
  { id: 'ITM1087', name: 'D29B (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 125, salePrice: 134, color: 'H23/PC-RAL', weight: 0.04 },
  { id: 'ITM1088', name: 'D29B (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 125, salePrice: 143, color: 'Sahra/BRN', weight: 0.04 },
  { id: 'ITM1089', name: 'D29B (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 125, salePrice: 150, color: 'Black/Multi', weight: 0.04 },
  { id: 'ITM1090', name: 'D29B (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 125, salePrice: 168, color: 'Wood Coat', weight: 0.04 },
  { id: 'ITM1091', name: 'D29F (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 90, salePrice: 98, color: 'Dull', weight: 0.03 },
  { id: 'ITM1092', name: 'D29F (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 90, salePrice: 99, color: 'H23/PC-RAL', weight: 0.03 },
  { id: 'ITM1093', name: 'D29F (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 90, salePrice: 106, color: 'Sahra/BRN', weight: 0.03 },
  { id: 'ITM1094', name: 'D29F (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 90, salePrice: 111, color: 'Black/Multi', weight: 0.03 },
  { id: 'ITM1095', name: 'D29F (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 90, salePrice: 124, color: 'Wood Coat', weight: 0.03 },
  { id: 'ITM1096', name: 'D31 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 140, salePrice: 149, color: 'Dull', weight: 0.048 },
  { id: 'ITM1097', name: 'D31 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 140, salePrice: 150, color: 'H23/PC-RAL', weight: 0.048 },
  { id: 'ITM1098', name: 'D31 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 140, salePrice: 161, color: 'Sahra/BRN', weight: 0.048 },
  { id: 'ITM1099', name: 'D31 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 140, salePrice: 168, color: 'Black/Multi', weight: 0.048 },
  { id: 'ITM1100', name: 'D31 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 140, salePrice: 188, color: 'Wood Coat', weight: 0.048 },
  { id: 'ITM1101', name: 'D31 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 180, salePrice: 192, color: 'Dull', weight: 0.065 },
  { id: 'ITM1102', name: 'D31 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 180, salePrice: 193, color: 'H23/PC-RAL', weight: 0.065 },
  { id: 'ITM1103', name: 'D31 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 180, salePrice: 207, color: 'Sahra/BRN', weight: 0.065 },
  { id: 'ITM1104', name: 'D31 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 180, salePrice: 216, color: 'Black/Multi', weight: 0.065 },
  { id: 'ITM1105', name: 'D31 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 180, salePrice: 241, color: 'Wood Coat', weight: 0.065 },
  { id: 'ITM1106', name: 'D31A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 190, salePrice: 199, color: 'Dull', weight: 0.066 },
  { id: 'ITM1107', name: 'D31A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 190, salePrice: 200, color: 'H23/PC-RAL', weight: 0.066 },
  { id: 'ITM1108', name: 'D31A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 190, salePrice: 214, color: 'Sahra/BRN', weight: 0.066 },
  { id: 'ITM1109', name: 'D31A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 190, salePrice: 224, color: 'Black/Multi', weight: 0.066 },
  { id: 'ITM1110', name: 'D31A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 190, salePrice: 250, color: 'Wood Coat', weight: 0.066 },
  { id: 'ITM1111', name: 'D32 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 75, salePrice: 83, color: 'Dull', weight: 0.028 },
  { id: 'ITM1112', name: 'D32 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 75, salePrice: 84, color: 'H23/PC-RAL', weight: 0.028 },
  { id: 'ITM1113', name: 'D32 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 75, salePrice: 90, color: 'Sahra/BRN', weight: 0.028 },
  { id: 'ITM1114', name: 'D32 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 75, salePrice: 94, color: 'Black/Multi', weight: 0.028 },
  { id: 'ITM1115', name: 'D32 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 75, salePrice: 105, color: 'Wood Coat', weight: 0.028 },
  { id: 'ITM1116', name: 'D32A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 140, salePrice: 147, color: 'Dull', weight: 0.048 },
  { id: 'ITM1117', name: 'D32A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 140, salePrice: 148, color: 'H23/PC-RAL', weight: 0.048 },
  { id: 'ITM1118', name: 'D32A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 140, salePrice: 158, color: 'Sahra/BRN', weight: 0.048 },
  { id: 'ITM1119', name: 'D32A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 140, salePrice: 166, color: 'Black/Multi', weight: 0.048 },
  { id: 'ITM1120', name: 'D32A (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 140, salePrice: 185, color: 'Wood Coat', weight: 0.048 },
  { id: 'ITM1121', name: 'D32B (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 145, salePrice: 154, color: 'Dull', weight: 0.051 },
  { id: 'ITM1122', name: 'D32B (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 145, salePrice: 155, color: 'H23/PC-RAL', weight: 0.051 },
  { id: 'ITM1123', name: 'D32B (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 145, salePrice: 166, color: 'Sahra/BRN', weight: 0.051 },
  { id: 'ITM1124', name: 'D32B (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 145, salePrice: 174, color: 'Black/Multi', weight: 0.051 },
  { id: 'ITM1125', name: 'D32B (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 145, salePrice: 194, color: 'Wood Coat', weight: 0.051 },
  { id: 'ITM1126', name: 'D32C (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 170, salePrice: 180, color: 'Dull', weight: 0.06 },
  { id: 'ITM1127', name: 'D32C (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 170, salePrice: 181, color: 'H23/PC-RAL', weight: 0.06 },
  { id: 'ITM1128', name: 'D32C (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 170, salePrice: 194, color: 'Sahra/BRN', weight: 0.06 },
  { id: 'ITM1129', name: 'D32C (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 170, salePrice: 203, color: 'Black/Multi', weight: 0.06 },
  { id: 'ITM1130', name: 'D32C (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 170, salePrice: 226, color: 'Wood Coat', weight: 0.06 },
  { id: 'ITM1131', name: 'D33 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 430, salePrice: 455, color: 'Dull', weight: 0.15 },
  { id: 'ITM1132', name: 'D33 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 430, salePrice: 457, color: 'H23/PC-RAL', weight: 0.15 },
  { id: 'ITM1133', name: 'D33 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 430, salePrice: 489, color: 'Sahra/BRN', weight: 0.15 },
  { id: 'ITM1134', name: 'D33 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 430, salePrice: 512, color: 'Black/Multi', weight: 0.15 },
  { id: 'ITM1135', name: 'D33 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 430, salePrice: 571, color: 'Wood Coat', weight: 0.15 },
  { id: 'ITM1136', name: 'D33 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 575, salePrice: 605, color: 'Dull', weight: 0.2 },
  { id: 'ITM1137', name: 'D33 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 575, salePrice: 607, color: 'H23/PC-RAL', weight: 0.2 },
  { id: 'ITM1138', name: 'D33 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 575, salePrice: 649, color: 'Sahra/BRN', weight: 0.2 },
  { id: 'ITM1139', name: 'D33 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 575, salePrice: 680, color: 'Black/Multi', weight: 0.2 },
  { id: 'ITM1140', name: 'D33 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 575, salePrice: 759, color: 'Wood Coat', weight: 0.2 },
  { id: 'ITM1141', name: 'D33 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 700, salePrice: 738, color: 'Dull', weight: 0.25 },
  { id: 'ITM1142', name: 'D33 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 700, salePrice: 740, color: 'H23/PC-RAL', weight: 0.25 },
  { id: 'ITM1143', name: 'D33 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 700, salePrice: 792, color: 'Sahra/BRN', weight: 0.25 },
  { id: 'ITM1144', name: 'D33 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 700, salePrice: 829, color: 'Black/Multi', weight: 0.25 },
  { id: 'ITM1145', name: 'D33 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 700, salePrice: 925, color: 'Wood Coat', weight: 0.25 },
  { id: 'ITM1146', name: 'D35 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 365, salePrice: 388, color: 'Dull', weight: 0.13 },
  { id: 'ITM1147', name: 'D35 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 365, salePrice: 390, color: 'H23/PC-RAL', weight: 0.13 },
  { id: 'ITM1148', name: 'D35 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 365, salePrice: 417, color: 'Sahra/BRN', weight: 0.13 },
  { id: 'ITM1149', name: 'D35 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 365, salePrice: 437, color: 'Black/Multi', weight: 0.13 },
  { id: 'ITM1150', name: 'D35 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 365, salePrice: 488, color: 'Wood Coat', weight: 0.13 },
  { id: 'ITM1151', name: 'D35 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 470, salePrice: 497, color: 'Dull', weight: 0.165 },
  { id: 'ITM1152', name: 'D35 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 470, salePrice: 499, color: 'H23/PC-RAL', weight: 0.165 },
  { id: 'ITM1153', name: 'D35 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 470, salePrice: 534, color: 'Sahra/BRN', weight: 0.165 },
  { id: 'ITM1154', name: 'D35 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 470, salePrice: 559, color: 'Black/Multi', weight: 0.165 },
  { id: 'ITM1155', name: 'D35 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 470, salePrice: 624, color: 'Wood Coat', weight: 0.165 },
  { id: 'ITM1156', name: 'D35 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 570, salePrice: 601, color: 'Dull', weight: 0.2 },
  { id: 'ITM1157', name: 'D35 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 570, salePrice: 603, color: 'H23/PC-RAL', weight: 0.2 },
  { id: 'ITM1158', name: 'D35 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 570, salePrice: 645, color: 'Sahra/BRN', weight: 0.2 },
  { id: 'ITM1159', name: 'D35 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 570, salePrice: 675, color: 'Black/Multi', weight: 0.2 },
  { id: 'ITM1160', name: 'D35 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 570, salePrice: 754, color: 'Wood Coat', weight: 0.2 },
  { id: 'ITM1161', name: 'D38 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 595, salePrice: 629, color: 'Dull', weight: 0.21 },
  { id: 'ITM1162', name: 'D38 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 595, salePrice: 631, color: 'H23/PC-RAL', weight: 0.21 },
  { id: 'ITM1163', name: 'D38 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 595, salePrice: 675, color: 'Sahra/BRN', weight: 0.21 },
  { id: 'ITM1164', name: 'D38 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 595, salePrice: 707, color: 'Black/Multi', weight: 0.21 },
  { id: 'ITM1165', name: 'D38 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 595, salePrice: 789, color: 'Wood Coat', weight: 0.21 },
  { id: 'ITM1166', name: 'D38B (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 345, salePrice: 367, color: 'Dull', weight: 0.12 },
  { id: 'ITM1167', name: 'D38B (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 345, salePrice: 369, color: 'H23/PC-RAL', weight: 0.12 },
  { id: 'ITM1168', name: 'D38B (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 345, salePrice: 395, color: 'Sahra/BRN', weight: 0.12 },
  { id: 'ITM1169', name: 'D38B (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 345, salePrice: 413, color: 'Black/Multi', weight: 0.12 },
  { id: 'ITM1170', name: 'D38B (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 345, salePrice: 461, color: 'Wood Coat', weight: 0.12 },
  { id: 'ITM1171', name: 'D38B (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 430, salePrice: 455, color: 'Dull', weight: 0.15 },
  { id: 'ITM1172', name: 'D38B (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 430, salePrice: 457, color: 'H23/PC-RAL', weight: 0.15 },
  { id: 'ITM1173', name: 'D38B (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 430, salePrice: 489, color: 'Sahra/BRN', weight: 0.15 },
  { id: 'ITM1174', name: 'D38B (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 430, salePrice: 512, color: 'Black/Multi', weight: 0.15 },
  { id: 'ITM1175', name: 'D38B (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 430, salePrice: 571, color: 'Wood Coat', weight: 0.15 },
  { id: 'ITM1176', name: 'D38F (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 410, salePrice: 432, color: 'Dull', weight: 0.14 },
  { id: 'ITM1177', name: 'D38F (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 410, salePrice: 434, color: 'H23/PC-RAL', weight: 0.14 },
  { id: 'ITM1178', name: 'D38F (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 410, salePrice: 464, color: 'Sahra/BRN', weight: 0.14 },
  { id: 'ITM1179', name: 'D38F (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 410, salePrice: 486, color: 'Black/Multi', weight: 0.14 },
  { id: 'ITM1180', name: 'D38F (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 410, salePrice: 543, color: 'Wood Coat', weight: 0.14 },
  { id: 'ITM1181', name: 'D38F (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 500, salePrice: 531, color: 'Dull', weight: 0.176 },
  { id: 'ITM1182', name: 'D38F (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 500, salePrice: 533, color: 'H23/PC-RAL', weight: 0.176 },
  { id: 'ITM1183', name: 'D38F (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 500, salePrice: 570, color: 'Sahra/BRN', weight: 0.176 },
  { id: 'ITM1184', name: 'D38F (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 500, salePrice: 597, color: 'Black/Multi', weight: 0.176 },
  { id: 'ITM1185', name: 'D38F (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 500, salePrice: 666, color: 'Wood Coat', weight: 0.176 },
  { id: 'ITM1186', name: 'D40 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 355, salePrice: 376, color: 'Dull', weight: 0.125 },
  { id: 'ITM1187', name: 'D40 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 355, salePrice: 378, color: 'H23/PC-RAL', weight: 0.125 },
  { id: 'ITM1188', name: 'D40 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 355, salePrice: 404, color: 'Sahra/BRN', weight: 0.125 },
  { id: 'ITM1189', name: 'D40 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 355, salePrice: 423, color: 'Black/Multi', weight: 0.125 },
  { id: 'ITM1190', name: 'D40 (1.2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 355, salePrice: 473, color: 'Wood Coat', weight: 0.125 },
  { id: 'ITM1191', name: 'D40 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 400, salePrice: 426, color: 'Dull', weight: 0.14 },
  { id: 'ITM1192', name: 'D40 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 400, salePrice: 428, color: 'H23/PC-RAL', weight: 0.14 },
  { id: 'ITM1193', name: 'D40 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 400, salePrice: 458, color: 'Sahra/BRN', weight: 0.14 },
  { id: 'ITM1194', name: 'D40 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 400, salePrice: 479, color: 'Black/Multi', weight: 0.14 },
  { id: 'ITM1195', name: 'D40 (1.6mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 400, salePrice: 535, color: 'Wood Coat', weight: 0.14 },
  { id: 'ITM1196', name: 'D40 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 495, salePrice: 524, color: 'Dull', weight: 0.175 },
  { id: 'ITM1197', name: 'D40 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 495, salePrice: 526, color: 'H23/PC-RAL', weight: 0.175 },
  { id: 'ITM1198', name: 'D40 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 495, salePrice: 563, color: 'Sahra/BRN', weight: 0.175 },
  { id: 'ITM1199', name: 'D40 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 495, salePrice: 589, color: 'Black/Multi', weight: 0.175 },
  { id: 'ITM1200', name: 'D40 (2mm)', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 495, salePrice: 658, color: 'Wood Coat', weight: 0.175 },
];

export const mockCustomers: Customer[] = [
 
];

export const mockSales: Sale[] = [];

export const mockExpenses: Expense[] = [];

export const getDashboardStats = () => {
  const totalSales = mockSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const totalStockValue = mockItems.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
  
  const totalCostOfGoodsSold = mockSales.reduce((sum, sale) => {
    const saleCost = sale.items.reduce((itemSum, saleItem) => {
      const item = mockItems.find(i => i.id === saleItem.itemId);
      if (!item) return itemSum;

      if (item.unit === 'Feet' && saleItem.length && saleItem.width) {
        const totalFeet = (saleItem.length * saleItem.width / 144) * saleItem.quantity;
        return itemSum + (item.purchasePrice * totalFeet);
      }
      return itemSum + (item.purchasePrice * saleItem.quantity);
    }, 0);
    return sum + saleCost;
  }, 0);

  const profitLoss = totalSales - totalCostOfGoodsSold - totalExpenses;

  const today = new Date();
  const todaySummary = {
    sales: mockSales.filter(s => s.date.toDateString() === today.toDateString()),
    expenses: mockExpenses.filter(e => e.date.toDateString() === today.toDateString()),
  };
  
  return {
    totalSales,
    totalExpenses,
    totalStockValue,
    profitLoss,
    todaySummary,
  };
};

export const getMonthlySalesData = () => {
  const salesByMonth: { [key: string]: number } = {};
  mockSales.forEach(sale => {
    const month = sale.date.toLocaleString('default', { month: 'short' });
    if (!salesByMonth[month]) {
      salesByMonth[month] = 0;
    }
    salesByMonth[month] += sale.total;
  });

  return Object.keys(salesByMonth).map(month => ({
    name: month,
    sales: salesByMonth[month],
  })).reverse();
};

export const getTransactions = () => {
  const salesAsTransactions = mockSales.map(sale => ({
    id: sale.id,
    date: sale.date,
    description: `Sale to ${sale.customerName}`,
    amount: sale.total,
    type: 'credit' as 'credit' | 'debit'
  }));

  const expensesAsTransactions = mockExpenses.map(expense => ({
    id: expense.id,
    date: expense.date,
    description: expense.title,
    amount: expense.amount,
    type: 'debit' as 'credit' | 'debit'
  }));

  return [...salesAsTransactions, ...expensesAsTransactions].sort((a,b) => b.date.getTime() - a.date.getTime());
}
