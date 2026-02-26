// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

import { SplayTree } from '../splay-tree';

describe('SplayTree', () => {
  describe('insert and find', () => {
    it('insert key 0 finds value 0', () => {
      const t = new SplayTree<number, number>();
      t.insert(0, 0);
      expect(t.find(0)).toBe(0);
    });
    it('insert key 1 finds value 10', () => {
      const t = new SplayTree<number, number>();
      t.insert(1, 10);
      expect(t.find(1)).toBe(10);
    });
    it('insert key 2 finds value 20', () => {
      const t = new SplayTree<number, number>();
      t.insert(2, 20);
      expect(t.find(2)).toBe(20);
    });
    it('insert key 3 finds value 30', () => {
      const t = new SplayTree<number, number>();
      t.insert(3, 30);
      expect(t.find(3)).toBe(30);
    });
    it('insert key 4 finds value 40', () => {
      const t = new SplayTree<number, number>();
      t.insert(4, 40);
      expect(t.find(4)).toBe(40);
    });
    it('insert key 5 finds value 50', () => {
      const t = new SplayTree<number, number>();
      t.insert(5, 50);
      expect(t.find(5)).toBe(50);
    });
    it('insert key 6 finds value 60', () => {
      const t = new SplayTree<number, number>();
      t.insert(6, 60);
      expect(t.find(6)).toBe(60);
    });
    it('insert key 7 finds value 70', () => {
      const t = new SplayTree<number, number>();
      t.insert(7, 70);
      expect(t.find(7)).toBe(70);
    });
    it('insert key 8 finds value 80', () => {
      const t = new SplayTree<number, number>();
      t.insert(8, 80);
      expect(t.find(8)).toBe(80);
    });
    it('insert key 9 finds value 90', () => {
      const t = new SplayTree<number, number>();
      t.insert(9, 90);
      expect(t.find(9)).toBe(90);
    });
    it('insert key 10 finds value 100', () => {
      const t = new SplayTree<number, number>();
      t.insert(10, 100);
      expect(t.find(10)).toBe(100);
    });
    it('insert key 11 finds value 110', () => {
      const t = new SplayTree<number, number>();
      t.insert(11, 110);
      expect(t.find(11)).toBe(110);
    });
    it('insert key 12 finds value 120', () => {
      const t = new SplayTree<number, number>();
      t.insert(12, 120);
      expect(t.find(12)).toBe(120);
    });
    it('insert key 13 finds value 130', () => {
      const t = new SplayTree<number, number>();
      t.insert(13, 130);
      expect(t.find(13)).toBe(130);
    });
    it('insert key 14 finds value 140', () => {
      const t = new SplayTree<number, number>();
      t.insert(14, 140);
      expect(t.find(14)).toBe(140);
    });
    it('insert key 15 finds value 150', () => {
      const t = new SplayTree<number, number>();
      t.insert(15, 150);
      expect(t.find(15)).toBe(150);
    });
    it('insert key 16 finds value 160', () => {
      const t = new SplayTree<number, number>();
      t.insert(16, 160);
      expect(t.find(16)).toBe(160);
    });
    it('insert key 17 finds value 170', () => {
      const t = new SplayTree<number, number>();
      t.insert(17, 170);
      expect(t.find(17)).toBe(170);
    });
    it('insert key 18 finds value 180', () => {
      const t = new SplayTree<number, number>();
      t.insert(18, 180);
      expect(t.find(18)).toBe(180);
    });
    it('insert key 19 finds value 190', () => {
      const t = new SplayTree<number, number>();
      t.insert(19, 190);
      expect(t.find(19)).toBe(190);
    });
    it('insert key 20 finds value 200', () => {
      const t = new SplayTree<number, number>();
      t.insert(20, 200);
      expect(t.find(20)).toBe(200);
    });
    it('insert key 21 finds value 210', () => {
      const t = new SplayTree<number, number>();
      t.insert(21, 210);
      expect(t.find(21)).toBe(210);
    });
    it('insert key 22 finds value 220', () => {
      const t = new SplayTree<number, number>();
      t.insert(22, 220);
      expect(t.find(22)).toBe(220);
    });
    it('insert key 23 finds value 230', () => {
      const t = new SplayTree<number, number>();
      t.insert(23, 230);
      expect(t.find(23)).toBe(230);
    });
    it('insert key 24 finds value 240', () => {
      const t = new SplayTree<number, number>();
      t.insert(24, 240);
      expect(t.find(24)).toBe(240);
    });
    it('insert key 25 finds value 250', () => {
      const t = new SplayTree<number, number>();
      t.insert(25, 250);
      expect(t.find(25)).toBe(250);
    });
    it('insert key 26 finds value 260', () => {
      const t = new SplayTree<number, number>();
      t.insert(26, 260);
      expect(t.find(26)).toBe(260);
    });
    it('insert key 27 finds value 270', () => {
      const t = new SplayTree<number, number>();
      t.insert(27, 270);
      expect(t.find(27)).toBe(270);
    });
    it('insert key 28 finds value 280', () => {
      const t = new SplayTree<number, number>();
      t.insert(28, 280);
      expect(t.find(28)).toBe(280);
    });
    it('insert key 29 finds value 290', () => {
      const t = new SplayTree<number, number>();
      t.insert(29, 290);
      expect(t.find(29)).toBe(290);
    });
    it('insert key 30 finds value 300', () => {
      const t = new SplayTree<number, number>();
      t.insert(30, 300);
      expect(t.find(30)).toBe(300);
    });
    it('insert key 31 finds value 310', () => {
      const t = new SplayTree<number, number>();
      t.insert(31, 310);
      expect(t.find(31)).toBe(310);
    });
    it('insert key 32 finds value 320', () => {
      const t = new SplayTree<number, number>();
      t.insert(32, 320);
      expect(t.find(32)).toBe(320);
    });
    it('insert key 33 finds value 330', () => {
      const t = new SplayTree<number, number>();
      t.insert(33, 330);
      expect(t.find(33)).toBe(330);
    });
    it('insert key 34 finds value 340', () => {
      const t = new SplayTree<number, number>();
      t.insert(34, 340);
      expect(t.find(34)).toBe(340);
    });
    it('insert key 35 finds value 350', () => {
      const t = new SplayTree<number, number>();
      t.insert(35, 350);
      expect(t.find(35)).toBe(350);
    });
    it('insert key 36 finds value 360', () => {
      const t = new SplayTree<number, number>();
      t.insert(36, 360);
      expect(t.find(36)).toBe(360);
    });
    it('insert key 37 finds value 370', () => {
      const t = new SplayTree<number, number>();
      t.insert(37, 370);
      expect(t.find(37)).toBe(370);
    });
    it('insert key 38 finds value 380', () => {
      const t = new SplayTree<number, number>();
      t.insert(38, 380);
      expect(t.find(38)).toBe(380);
    });
    it('insert key 39 finds value 390', () => {
      const t = new SplayTree<number, number>();
      t.insert(39, 390);
      expect(t.find(39)).toBe(390);
    });
    it('insert key 40 finds value 400', () => {
      const t = new SplayTree<number, number>();
      t.insert(40, 400);
      expect(t.find(40)).toBe(400);
    });
    it('insert key 41 finds value 410', () => {
      const t = new SplayTree<number, number>();
      t.insert(41, 410);
      expect(t.find(41)).toBe(410);
    });
    it('insert key 42 finds value 420', () => {
      const t = new SplayTree<number, number>();
      t.insert(42, 420);
      expect(t.find(42)).toBe(420);
    });
    it('insert key 43 finds value 430', () => {
      const t = new SplayTree<number, number>();
      t.insert(43, 430);
      expect(t.find(43)).toBe(430);
    });
    it('insert key 44 finds value 440', () => {
      const t = new SplayTree<number, number>();
      t.insert(44, 440);
      expect(t.find(44)).toBe(440);
    });
    it('insert key 45 finds value 450', () => {
      const t = new SplayTree<number, number>();
      t.insert(45, 450);
      expect(t.find(45)).toBe(450);
    });
    it('insert key 46 finds value 460', () => {
      const t = new SplayTree<number, number>();
      t.insert(46, 460);
      expect(t.find(46)).toBe(460);
    });
    it('insert key 47 finds value 470', () => {
      const t = new SplayTree<number, number>();
      t.insert(47, 470);
      expect(t.find(47)).toBe(470);
    });
    it('insert key 48 finds value 480', () => {
      const t = new SplayTree<number, number>();
      t.insert(48, 480);
      expect(t.find(48)).toBe(480);
    });
    it('insert key 49 finds value 490', () => {
      const t = new SplayTree<number, number>();
      t.insert(49, 490);
      expect(t.find(49)).toBe(490);
    });
    it('insert key 50 finds value 500', () => {
      const t = new SplayTree<number, number>();
      t.insert(50, 500);
      expect(t.find(50)).toBe(500);
    });
    it('insert key 51 finds value 510', () => {
      const t = new SplayTree<number, number>();
      t.insert(51, 510);
      expect(t.find(51)).toBe(510);
    });
    it('insert key 52 finds value 520', () => {
      const t = new SplayTree<number, number>();
      t.insert(52, 520);
      expect(t.find(52)).toBe(520);
    });
    it('insert key 53 finds value 530', () => {
      const t = new SplayTree<number, number>();
      t.insert(53, 530);
      expect(t.find(53)).toBe(530);
    });
    it('insert key 54 finds value 540', () => {
      const t = new SplayTree<number, number>();
      t.insert(54, 540);
      expect(t.find(54)).toBe(540);
    });
    it('insert key 55 finds value 550', () => {
      const t = new SplayTree<number, number>();
      t.insert(55, 550);
      expect(t.find(55)).toBe(550);
    });
    it('insert key 56 finds value 560', () => {
      const t = new SplayTree<number, number>();
      t.insert(56, 560);
      expect(t.find(56)).toBe(560);
    });
    it('insert key 57 finds value 570', () => {
      const t = new SplayTree<number, number>();
      t.insert(57, 570);
      expect(t.find(57)).toBe(570);
    });
    it('insert key 58 finds value 580', () => {
      const t = new SplayTree<number, number>();
      t.insert(58, 580);
      expect(t.find(58)).toBe(580);
    });
    it('insert key 59 finds value 590', () => {
      const t = new SplayTree<number, number>();
      t.insert(59, 590);
      expect(t.find(59)).toBe(590);
    });
    it('insert key 60 finds value 600', () => {
      const t = new SplayTree<number, number>();
      t.insert(60, 600);
      expect(t.find(60)).toBe(600);
    });
    it('insert key 61 finds value 610', () => {
      const t = new SplayTree<number, number>();
      t.insert(61, 610);
      expect(t.find(61)).toBe(610);
    });
    it('insert key 62 finds value 620', () => {
      const t = new SplayTree<number, number>();
      t.insert(62, 620);
      expect(t.find(62)).toBe(620);
    });
    it('insert key 63 finds value 630', () => {
      const t = new SplayTree<number, number>();
      t.insert(63, 630);
      expect(t.find(63)).toBe(630);
    });
    it('insert key 64 finds value 640', () => {
      const t = new SplayTree<number, number>();
      t.insert(64, 640);
      expect(t.find(64)).toBe(640);
    });
    it('insert key 65 finds value 650', () => {
      const t = new SplayTree<number, number>();
      t.insert(65, 650);
      expect(t.find(65)).toBe(650);
    });
    it('insert key 66 finds value 660', () => {
      const t = new SplayTree<number, number>();
      t.insert(66, 660);
      expect(t.find(66)).toBe(660);
    });
    it('insert key 67 finds value 670', () => {
      const t = new SplayTree<number, number>();
      t.insert(67, 670);
      expect(t.find(67)).toBe(670);
    });
    it('insert key 68 finds value 680', () => {
      const t = new SplayTree<number, number>();
      t.insert(68, 680);
      expect(t.find(68)).toBe(680);
    });
    it('insert key 69 finds value 690', () => {
      const t = new SplayTree<number, number>();
      t.insert(69, 690);
      expect(t.find(69)).toBe(690);
    });
    it('insert key 70 finds value 700', () => {
      const t = new SplayTree<number, number>();
      t.insert(70, 700);
      expect(t.find(70)).toBe(700);
    });
    it('insert key 71 finds value 710', () => {
      const t = new SplayTree<number, number>();
      t.insert(71, 710);
      expect(t.find(71)).toBe(710);
    });
    it('insert key 72 finds value 720', () => {
      const t = new SplayTree<number, number>();
      t.insert(72, 720);
      expect(t.find(72)).toBe(720);
    });
    it('insert key 73 finds value 730', () => {
      const t = new SplayTree<number, number>();
      t.insert(73, 730);
      expect(t.find(73)).toBe(730);
    });
    it('insert key 74 finds value 740', () => {
      const t = new SplayTree<number, number>();
      t.insert(74, 740);
      expect(t.find(74)).toBe(740);
    });
    it('insert key 75 finds value 750', () => {
      const t = new SplayTree<number, number>();
      t.insert(75, 750);
      expect(t.find(75)).toBe(750);
    });
    it('insert key 76 finds value 760', () => {
      const t = new SplayTree<number, number>();
      t.insert(76, 760);
      expect(t.find(76)).toBe(760);
    });
    it('insert key 77 finds value 770', () => {
      const t = new SplayTree<number, number>();
      t.insert(77, 770);
      expect(t.find(77)).toBe(770);
    });
    it('insert key 78 finds value 780', () => {
      const t = new SplayTree<number, number>();
      t.insert(78, 780);
      expect(t.find(78)).toBe(780);
    });
    it('insert key 79 finds value 790', () => {
      const t = new SplayTree<number, number>();
      t.insert(79, 790);
      expect(t.find(79)).toBe(790);
    });
    it('insert key 80 finds value 800', () => {
      const t = new SplayTree<number, number>();
      t.insert(80, 800);
      expect(t.find(80)).toBe(800);
    });
    it('insert key 81 finds value 810', () => {
      const t = new SplayTree<number, number>();
      t.insert(81, 810);
      expect(t.find(81)).toBe(810);
    });
    it('insert key 82 finds value 820', () => {
      const t = new SplayTree<number, number>();
      t.insert(82, 820);
      expect(t.find(82)).toBe(820);
    });
    it('insert key 83 finds value 830', () => {
      const t = new SplayTree<number, number>();
      t.insert(83, 830);
      expect(t.find(83)).toBe(830);
    });
    it('insert key 84 finds value 840', () => {
      const t = new SplayTree<number, number>();
      t.insert(84, 840);
      expect(t.find(84)).toBe(840);
    });
    it('insert key 85 finds value 850', () => {
      const t = new SplayTree<number, number>();
      t.insert(85, 850);
      expect(t.find(85)).toBe(850);
    });
    it('insert key 86 finds value 860', () => {
      const t = new SplayTree<number, number>();
      t.insert(86, 860);
      expect(t.find(86)).toBe(860);
    });
    it('insert key 87 finds value 870', () => {
      const t = new SplayTree<number, number>();
      t.insert(87, 870);
      expect(t.find(87)).toBe(870);
    });
    it('insert key 88 finds value 880', () => {
      const t = new SplayTree<number, number>();
      t.insert(88, 880);
      expect(t.find(88)).toBe(880);
    });
    it('insert key 89 finds value 890', () => {
      const t = new SplayTree<number, number>();
      t.insert(89, 890);
      expect(t.find(89)).toBe(890);
    });
    it('insert key 90 finds value 900', () => {
      const t = new SplayTree<number, number>();
      t.insert(90, 900);
      expect(t.find(90)).toBe(900);
    });
    it('insert key 91 finds value 910', () => {
      const t = new SplayTree<number, number>();
      t.insert(91, 910);
      expect(t.find(91)).toBe(910);
    });
    it('insert key 92 finds value 920', () => {
      const t = new SplayTree<number, number>();
      t.insert(92, 920);
      expect(t.find(92)).toBe(920);
    });
    it('insert key 93 finds value 930', () => {
      const t = new SplayTree<number, number>();
      t.insert(93, 930);
      expect(t.find(93)).toBe(930);
    });
    it('insert key 94 finds value 940', () => {
      const t = new SplayTree<number, number>();
      t.insert(94, 940);
      expect(t.find(94)).toBe(940);
    });
    it('insert key 95 finds value 950', () => {
      const t = new SplayTree<number, number>();
      t.insert(95, 950);
      expect(t.find(95)).toBe(950);
    });
    it('insert key 96 finds value 960', () => {
      const t = new SplayTree<number, number>();
      t.insert(96, 960);
      expect(t.find(96)).toBe(960);
    });
    it('insert key 97 finds value 970', () => {
      const t = new SplayTree<number, number>();
      t.insert(97, 970);
      expect(t.find(97)).toBe(970);
    });
    it('insert key 98 finds value 980', () => {
      const t = new SplayTree<number, number>();
      t.insert(98, 980);
      expect(t.find(98)).toBe(980);
    });
    it('insert key 99 finds value 990', () => {
      const t = new SplayTree<number, number>();
      t.insert(99, 990);
      expect(t.find(99)).toBe(990);
    });
  });

  describe('has returns false for missing keys', () => {
    it('has returns false for missing key 0', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(0)).toBe(false);
    });
    it('has returns false for missing key 1', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(1)).toBe(false);
    });
    it('has returns false for missing key 2', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(2)).toBe(false);
    });
    it('has returns false for missing key 3', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(3)).toBe(false);
    });
    it('has returns false for missing key 4', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(4)).toBe(false);
    });
    it('has returns false for missing key 5', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(5)).toBe(false);
    });
    it('has returns false for missing key 6', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(6)).toBe(false);
    });
    it('has returns false for missing key 7', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(7)).toBe(false);
    });
    it('has returns false for missing key 8', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(8)).toBe(false);
    });
    it('has returns false for missing key 9', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(9)).toBe(false);
    });
    it('has returns false for missing key 10', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(10)).toBe(false);
    });
    it('has returns false for missing key 11', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(11)).toBe(false);
    });
    it('has returns false for missing key 12', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(12)).toBe(false);
    });
    it('has returns false for missing key 13', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(13)).toBe(false);
    });
    it('has returns false for missing key 14', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(14)).toBe(false);
    });
    it('has returns false for missing key 15', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(15)).toBe(false);
    });
    it('has returns false for missing key 16', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(16)).toBe(false);
    });
    it('has returns false for missing key 17', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(17)).toBe(false);
    });
    it('has returns false for missing key 18', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(18)).toBe(false);
    });
    it('has returns false for missing key 19', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(19)).toBe(false);
    });
    it('has returns false for missing key 20', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(20)).toBe(false);
    });
    it('has returns false for missing key 21', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(21)).toBe(false);
    });
    it('has returns false for missing key 22', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(22)).toBe(false);
    });
    it('has returns false for missing key 23', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(23)).toBe(false);
    });
    it('has returns false for missing key 24', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(24)).toBe(false);
    });
    it('has returns false for missing key 25', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(25)).toBe(false);
    });
    it('has returns false for missing key 26', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(26)).toBe(false);
    });
    it('has returns false for missing key 27', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(27)).toBe(false);
    });
    it('has returns false for missing key 28', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(28)).toBe(false);
    });
    it('has returns false for missing key 29', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(29)).toBe(false);
    });
    it('has returns false for missing key 30', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(30)).toBe(false);
    });
    it('has returns false for missing key 31', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(31)).toBe(false);
    });
    it('has returns false for missing key 32', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(32)).toBe(false);
    });
    it('has returns false for missing key 33', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(33)).toBe(false);
    });
    it('has returns false for missing key 34', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(34)).toBe(false);
    });
    it('has returns false for missing key 35', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(35)).toBe(false);
    });
    it('has returns false for missing key 36', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(36)).toBe(false);
    });
    it('has returns false for missing key 37', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(37)).toBe(false);
    });
    it('has returns false for missing key 38', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(38)).toBe(false);
    });
    it('has returns false for missing key 39', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(39)).toBe(false);
    });
    it('has returns false for missing key 40', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(40)).toBe(false);
    });
    it('has returns false for missing key 41', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(41)).toBe(false);
    });
    it('has returns false for missing key 42', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(42)).toBe(false);
    });
    it('has returns false for missing key 43', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(43)).toBe(false);
    });
    it('has returns false for missing key 44', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(44)).toBe(false);
    });
    it('has returns false for missing key 45', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(45)).toBe(false);
    });
    it('has returns false for missing key 46', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(46)).toBe(false);
    });
    it('has returns false for missing key 47', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(47)).toBe(false);
    });
    it('has returns false for missing key 48', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(48)).toBe(false);
    });
    it('has returns false for missing key 49', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(49)).toBe(false);
    });
    it('has returns false for missing key 50', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(50)).toBe(false);
    });
    it('has returns false for missing key 51', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(51)).toBe(false);
    });
    it('has returns false for missing key 52', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(52)).toBe(false);
    });
    it('has returns false for missing key 53', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(53)).toBe(false);
    });
    it('has returns false for missing key 54', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(54)).toBe(false);
    });
    it('has returns false for missing key 55', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(55)).toBe(false);
    });
    it('has returns false for missing key 56', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(56)).toBe(false);
    });
    it('has returns false for missing key 57', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(57)).toBe(false);
    });
    it('has returns false for missing key 58', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(58)).toBe(false);
    });
    it('has returns false for missing key 59', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(59)).toBe(false);
    });
    it('has returns false for missing key 60', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(60)).toBe(false);
    });
    it('has returns false for missing key 61', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(61)).toBe(false);
    });
    it('has returns false for missing key 62', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(62)).toBe(false);
    });
    it('has returns false for missing key 63', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(63)).toBe(false);
    });
    it('has returns false for missing key 64', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(64)).toBe(false);
    });
    it('has returns false for missing key 65', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(65)).toBe(false);
    });
    it('has returns false for missing key 66', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(66)).toBe(false);
    });
    it('has returns false for missing key 67', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(67)).toBe(false);
    });
    it('has returns false for missing key 68', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(68)).toBe(false);
    });
    it('has returns false for missing key 69', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(69)).toBe(false);
    });
    it('has returns false for missing key 70', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(70)).toBe(false);
    });
    it('has returns false for missing key 71', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(71)).toBe(false);
    });
    it('has returns false for missing key 72', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(72)).toBe(false);
    });
    it('has returns false for missing key 73', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(73)).toBe(false);
    });
    it('has returns false for missing key 74', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(74)).toBe(false);
    });
    it('has returns false for missing key 75', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(75)).toBe(false);
    });
    it('has returns false for missing key 76', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(76)).toBe(false);
    });
    it('has returns false for missing key 77', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(77)).toBe(false);
    });
    it('has returns false for missing key 78', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(78)).toBe(false);
    });
    it('has returns false for missing key 79', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(79)).toBe(false);
    });
    it('has returns false for missing key 80', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(80)).toBe(false);
    });
    it('has returns false for missing key 81', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(81)).toBe(false);
    });
    it('has returns false for missing key 82', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(82)).toBe(false);
    });
    it('has returns false for missing key 83', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(83)).toBe(false);
    });
    it('has returns false for missing key 84', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(84)).toBe(false);
    });
    it('has returns false for missing key 85', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(85)).toBe(false);
    });
    it('has returns false for missing key 86', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(86)).toBe(false);
    });
    it('has returns false for missing key 87', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(87)).toBe(false);
    });
    it('has returns false for missing key 88', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(88)).toBe(false);
    });
    it('has returns false for missing key 89', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(89)).toBe(false);
    });
    it('has returns false for missing key 90', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(90)).toBe(false);
    });
    it('has returns false for missing key 91', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(91)).toBe(false);
    });
    it('has returns false for missing key 92', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(92)).toBe(false);
    });
    it('has returns false for missing key 93', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(93)).toBe(false);
    });
    it('has returns false for missing key 94', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(94)).toBe(false);
    });
    it('has returns false for missing key 95', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(95)).toBe(false);
    });
    it('has returns false for missing key 96', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(96)).toBe(false);
    });
    it('has returns false for missing key 97', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(97)).toBe(false);
    });
    it('has returns false for missing key 98', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(98)).toBe(false);
    });
    it('has returns false for missing key 99', () => {
      const t = new SplayTree<number, number>();
      expect(t.has(99)).toBe(false);
    });
  });

  describe('has returns true after insert', () => {
    it('has returns true after inserting key 0', () => {
      const t = new SplayTree<number, number>();
      t.insert(0, 0);
      expect(t.has(0)).toBe(true);
    });
    it('has returns true after inserting key 1', () => {
      const t = new SplayTree<number, number>();
      t.insert(1, 1);
      expect(t.has(1)).toBe(true);
    });
    it('has returns true after inserting key 2', () => {
      const t = new SplayTree<number, number>();
      t.insert(2, 2);
      expect(t.has(2)).toBe(true);
    });
    it('has returns true after inserting key 3', () => {
      const t = new SplayTree<number, number>();
      t.insert(3, 3);
      expect(t.has(3)).toBe(true);
    });
    it('has returns true after inserting key 4', () => {
      const t = new SplayTree<number, number>();
      t.insert(4, 4);
      expect(t.has(4)).toBe(true);
    });
    it('has returns true after inserting key 5', () => {
      const t = new SplayTree<number, number>();
      t.insert(5, 5);
      expect(t.has(5)).toBe(true);
    });
    it('has returns true after inserting key 6', () => {
      const t = new SplayTree<number, number>();
      t.insert(6, 6);
      expect(t.has(6)).toBe(true);
    });
    it('has returns true after inserting key 7', () => {
      const t = new SplayTree<number, number>();
      t.insert(7, 7);
      expect(t.has(7)).toBe(true);
    });
    it('has returns true after inserting key 8', () => {
      const t = new SplayTree<number, number>();
      t.insert(8, 8);
      expect(t.has(8)).toBe(true);
    });
    it('has returns true after inserting key 9', () => {
      const t = new SplayTree<number, number>();
      t.insert(9, 9);
      expect(t.has(9)).toBe(true);
    });
    it('has returns true after inserting key 10', () => {
      const t = new SplayTree<number, number>();
      t.insert(10, 10);
      expect(t.has(10)).toBe(true);
    });
    it('has returns true after inserting key 11', () => {
      const t = new SplayTree<number, number>();
      t.insert(11, 11);
      expect(t.has(11)).toBe(true);
    });
    it('has returns true after inserting key 12', () => {
      const t = new SplayTree<number, number>();
      t.insert(12, 12);
      expect(t.has(12)).toBe(true);
    });
    it('has returns true after inserting key 13', () => {
      const t = new SplayTree<number, number>();
      t.insert(13, 13);
      expect(t.has(13)).toBe(true);
    });
    it('has returns true after inserting key 14', () => {
      const t = new SplayTree<number, number>();
      t.insert(14, 14);
      expect(t.has(14)).toBe(true);
    });
    it('has returns true after inserting key 15', () => {
      const t = new SplayTree<number, number>();
      t.insert(15, 15);
      expect(t.has(15)).toBe(true);
    });
    it('has returns true after inserting key 16', () => {
      const t = new SplayTree<number, number>();
      t.insert(16, 16);
      expect(t.has(16)).toBe(true);
    });
    it('has returns true after inserting key 17', () => {
      const t = new SplayTree<number, number>();
      t.insert(17, 17);
      expect(t.has(17)).toBe(true);
    });
    it('has returns true after inserting key 18', () => {
      const t = new SplayTree<number, number>();
      t.insert(18, 18);
      expect(t.has(18)).toBe(true);
    });
    it('has returns true after inserting key 19', () => {
      const t = new SplayTree<number, number>();
      t.insert(19, 19);
      expect(t.has(19)).toBe(true);
    });
    it('has returns true after inserting key 20', () => {
      const t = new SplayTree<number, number>();
      t.insert(20, 20);
      expect(t.has(20)).toBe(true);
    });
    it('has returns true after inserting key 21', () => {
      const t = new SplayTree<number, number>();
      t.insert(21, 21);
      expect(t.has(21)).toBe(true);
    });
    it('has returns true after inserting key 22', () => {
      const t = new SplayTree<number, number>();
      t.insert(22, 22);
      expect(t.has(22)).toBe(true);
    });
    it('has returns true after inserting key 23', () => {
      const t = new SplayTree<number, number>();
      t.insert(23, 23);
      expect(t.has(23)).toBe(true);
    });
    it('has returns true after inserting key 24', () => {
      const t = new SplayTree<number, number>();
      t.insert(24, 24);
      expect(t.has(24)).toBe(true);
    });
    it('has returns true after inserting key 25', () => {
      const t = new SplayTree<number, number>();
      t.insert(25, 25);
      expect(t.has(25)).toBe(true);
    });
    it('has returns true after inserting key 26', () => {
      const t = new SplayTree<number, number>();
      t.insert(26, 26);
      expect(t.has(26)).toBe(true);
    });
    it('has returns true after inserting key 27', () => {
      const t = new SplayTree<number, number>();
      t.insert(27, 27);
      expect(t.has(27)).toBe(true);
    });
    it('has returns true after inserting key 28', () => {
      const t = new SplayTree<number, number>();
      t.insert(28, 28);
      expect(t.has(28)).toBe(true);
    });
    it('has returns true after inserting key 29', () => {
      const t = new SplayTree<number, number>();
      t.insert(29, 29);
      expect(t.has(29)).toBe(true);
    });
    it('has returns true after inserting key 30', () => {
      const t = new SplayTree<number, number>();
      t.insert(30, 30);
      expect(t.has(30)).toBe(true);
    });
    it('has returns true after inserting key 31', () => {
      const t = new SplayTree<number, number>();
      t.insert(31, 31);
      expect(t.has(31)).toBe(true);
    });
    it('has returns true after inserting key 32', () => {
      const t = new SplayTree<number, number>();
      t.insert(32, 32);
      expect(t.has(32)).toBe(true);
    });
    it('has returns true after inserting key 33', () => {
      const t = new SplayTree<number, number>();
      t.insert(33, 33);
      expect(t.has(33)).toBe(true);
    });
    it('has returns true after inserting key 34', () => {
      const t = new SplayTree<number, number>();
      t.insert(34, 34);
      expect(t.has(34)).toBe(true);
    });
    it('has returns true after inserting key 35', () => {
      const t = new SplayTree<number, number>();
      t.insert(35, 35);
      expect(t.has(35)).toBe(true);
    });
    it('has returns true after inserting key 36', () => {
      const t = new SplayTree<number, number>();
      t.insert(36, 36);
      expect(t.has(36)).toBe(true);
    });
    it('has returns true after inserting key 37', () => {
      const t = new SplayTree<number, number>();
      t.insert(37, 37);
      expect(t.has(37)).toBe(true);
    });
    it('has returns true after inserting key 38', () => {
      const t = new SplayTree<number, number>();
      t.insert(38, 38);
      expect(t.has(38)).toBe(true);
    });
    it('has returns true after inserting key 39', () => {
      const t = new SplayTree<number, number>();
      t.insert(39, 39);
      expect(t.has(39)).toBe(true);
    });
    it('has returns true after inserting key 40', () => {
      const t = new SplayTree<number, number>();
      t.insert(40, 40);
      expect(t.has(40)).toBe(true);
    });
    it('has returns true after inserting key 41', () => {
      const t = new SplayTree<number, number>();
      t.insert(41, 41);
      expect(t.has(41)).toBe(true);
    });
    it('has returns true after inserting key 42', () => {
      const t = new SplayTree<number, number>();
      t.insert(42, 42);
      expect(t.has(42)).toBe(true);
    });
    it('has returns true after inserting key 43', () => {
      const t = new SplayTree<number, number>();
      t.insert(43, 43);
      expect(t.has(43)).toBe(true);
    });
    it('has returns true after inserting key 44', () => {
      const t = new SplayTree<number, number>();
      t.insert(44, 44);
      expect(t.has(44)).toBe(true);
    });
    it('has returns true after inserting key 45', () => {
      const t = new SplayTree<number, number>();
      t.insert(45, 45);
      expect(t.has(45)).toBe(true);
    });
    it('has returns true after inserting key 46', () => {
      const t = new SplayTree<number, number>();
      t.insert(46, 46);
      expect(t.has(46)).toBe(true);
    });
    it('has returns true after inserting key 47', () => {
      const t = new SplayTree<number, number>();
      t.insert(47, 47);
      expect(t.has(47)).toBe(true);
    });
    it('has returns true after inserting key 48', () => {
      const t = new SplayTree<number, number>();
      t.insert(48, 48);
      expect(t.has(48)).toBe(true);
    });
    it('has returns true after inserting key 49', () => {
      const t = new SplayTree<number, number>();
      t.insert(49, 49);
      expect(t.has(49)).toBe(true);
    });
    it('has returns true after inserting key 50', () => {
      const t = new SplayTree<number, number>();
      t.insert(50, 50);
      expect(t.has(50)).toBe(true);
    });
    it('has returns true after inserting key 51', () => {
      const t = new SplayTree<number, number>();
      t.insert(51, 51);
      expect(t.has(51)).toBe(true);
    });
    it('has returns true after inserting key 52', () => {
      const t = new SplayTree<number, number>();
      t.insert(52, 52);
      expect(t.has(52)).toBe(true);
    });
    it('has returns true after inserting key 53', () => {
      const t = new SplayTree<number, number>();
      t.insert(53, 53);
      expect(t.has(53)).toBe(true);
    });
    it('has returns true after inserting key 54', () => {
      const t = new SplayTree<number, number>();
      t.insert(54, 54);
      expect(t.has(54)).toBe(true);
    });
    it('has returns true after inserting key 55', () => {
      const t = new SplayTree<number, number>();
      t.insert(55, 55);
      expect(t.has(55)).toBe(true);
    });
    it('has returns true after inserting key 56', () => {
      const t = new SplayTree<number, number>();
      t.insert(56, 56);
      expect(t.has(56)).toBe(true);
    });
    it('has returns true after inserting key 57', () => {
      const t = new SplayTree<number, number>();
      t.insert(57, 57);
      expect(t.has(57)).toBe(true);
    });
    it('has returns true after inserting key 58', () => {
      const t = new SplayTree<number, number>();
      t.insert(58, 58);
      expect(t.has(58)).toBe(true);
    });
    it('has returns true after inserting key 59', () => {
      const t = new SplayTree<number, number>();
      t.insert(59, 59);
      expect(t.has(59)).toBe(true);
    });
    it('has returns true after inserting key 60', () => {
      const t = new SplayTree<number, number>();
      t.insert(60, 60);
      expect(t.has(60)).toBe(true);
    });
    it('has returns true after inserting key 61', () => {
      const t = new SplayTree<number, number>();
      t.insert(61, 61);
      expect(t.has(61)).toBe(true);
    });
    it('has returns true after inserting key 62', () => {
      const t = new SplayTree<number, number>();
      t.insert(62, 62);
      expect(t.has(62)).toBe(true);
    });
    it('has returns true after inserting key 63', () => {
      const t = new SplayTree<number, number>();
      t.insert(63, 63);
      expect(t.has(63)).toBe(true);
    });
    it('has returns true after inserting key 64', () => {
      const t = new SplayTree<number, number>();
      t.insert(64, 64);
      expect(t.has(64)).toBe(true);
    });
    it('has returns true after inserting key 65', () => {
      const t = new SplayTree<number, number>();
      t.insert(65, 65);
      expect(t.has(65)).toBe(true);
    });
    it('has returns true after inserting key 66', () => {
      const t = new SplayTree<number, number>();
      t.insert(66, 66);
      expect(t.has(66)).toBe(true);
    });
    it('has returns true after inserting key 67', () => {
      const t = new SplayTree<number, number>();
      t.insert(67, 67);
      expect(t.has(67)).toBe(true);
    });
    it('has returns true after inserting key 68', () => {
      const t = new SplayTree<number, number>();
      t.insert(68, 68);
      expect(t.has(68)).toBe(true);
    });
    it('has returns true after inserting key 69', () => {
      const t = new SplayTree<number, number>();
      t.insert(69, 69);
      expect(t.has(69)).toBe(true);
    });
    it('has returns true after inserting key 70', () => {
      const t = new SplayTree<number, number>();
      t.insert(70, 70);
      expect(t.has(70)).toBe(true);
    });
    it('has returns true after inserting key 71', () => {
      const t = new SplayTree<number, number>();
      t.insert(71, 71);
      expect(t.has(71)).toBe(true);
    });
    it('has returns true after inserting key 72', () => {
      const t = new SplayTree<number, number>();
      t.insert(72, 72);
      expect(t.has(72)).toBe(true);
    });
    it('has returns true after inserting key 73', () => {
      const t = new SplayTree<number, number>();
      t.insert(73, 73);
      expect(t.has(73)).toBe(true);
    });
    it('has returns true after inserting key 74', () => {
      const t = new SplayTree<number, number>();
      t.insert(74, 74);
      expect(t.has(74)).toBe(true);
    });
    it('has returns true after inserting key 75', () => {
      const t = new SplayTree<number, number>();
      t.insert(75, 75);
      expect(t.has(75)).toBe(true);
    });
    it('has returns true after inserting key 76', () => {
      const t = new SplayTree<number, number>();
      t.insert(76, 76);
      expect(t.has(76)).toBe(true);
    });
    it('has returns true after inserting key 77', () => {
      const t = new SplayTree<number, number>();
      t.insert(77, 77);
      expect(t.has(77)).toBe(true);
    });
    it('has returns true after inserting key 78', () => {
      const t = new SplayTree<number, number>();
      t.insert(78, 78);
      expect(t.has(78)).toBe(true);
    });
    it('has returns true after inserting key 79', () => {
      const t = new SplayTree<number, number>();
      t.insert(79, 79);
      expect(t.has(79)).toBe(true);
    });
    it('has returns true after inserting key 80', () => {
      const t = new SplayTree<number, number>();
      t.insert(80, 80);
      expect(t.has(80)).toBe(true);
    });
    it('has returns true after inserting key 81', () => {
      const t = new SplayTree<number, number>();
      t.insert(81, 81);
      expect(t.has(81)).toBe(true);
    });
    it('has returns true after inserting key 82', () => {
      const t = new SplayTree<number, number>();
      t.insert(82, 82);
      expect(t.has(82)).toBe(true);
    });
    it('has returns true after inserting key 83', () => {
      const t = new SplayTree<number, number>();
      t.insert(83, 83);
      expect(t.has(83)).toBe(true);
    });
    it('has returns true after inserting key 84', () => {
      const t = new SplayTree<number, number>();
      t.insert(84, 84);
      expect(t.has(84)).toBe(true);
    });
    it('has returns true after inserting key 85', () => {
      const t = new SplayTree<number, number>();
      t.insert(85, 85);
      expect(t.has(85)).toBe(true);
    });
    it('has returns true after inserting key 86', () => {
      const t = new SplayTree<number, number>();
      t.insert(86, 86);
      expect(t.has(86)).toBe(true);
    });
    it('has returns true after inserting key 87', () => {
      const t = new SplayTree<number, number>();
      t.insert(87, 87);
      expect(t.has(87)).toBe(true);
    });
    it('has returns true after inserting key 88', () => {
      const t = new SplayTree<number, number>();
      t.insert(88, 88);
      expect(t.has(88)).toBe(true);
    });
    it('has returns true after inserting key 89', () => {
      const t = new SplayTree<number, number>();
      t.insert(89, 89);
      expect(t.has(89)).toBe(true);
    });
    it('has returns true after inserting key 90', () => {
      const t = new SplayTree<number, number>();
      t.insert(90, 90);
      expect(t.has(90)).toBe(true);
    });
    it('has returns true after inserting key 91', () => {
      const t = new SplayTree<number, number>();
      t.insert(91, 91);
      expect(t.has(91)).toBe(true);
    });
    it('has returns true after inserting key 92', () => {
      const t = new SplayTree<number, number>();
      t.insert(92, 92);
      expect(t.has(92)).toBe(true);
    });
    it('has returns true after inserting key 93', () => {
      const t = new SplayTree<number, number>();
      t.insert(93, 93);
      expect(t.has(93)).toBe(true);
    });
    it('has returns true after inserting key 94', () => {
      const t = new SplayTree<number, number>();
      t.insert(94, 94);
      expect(t.has(94)).toBe(true);
    });
    it('has returns true after inserting key 95', () => {
      const t = new SplayTree<number, number>();
      t.insert(95, 95);
      expect(t.has(95)).toBe(true);
    });
    it('has returns true after inserting key 96', () => {
      const t = new SplayTree<number, number>();
      t.insert(96, 96);
      expect(t.has(96)).toBe(true);
    });
    it('has returns true after inserting key 97', () => {
      const t = new SplayTree<number, number>();
      t.insert(97, 97);
      expect(t.has(97)).toBe(true);
    });
    it('has returns true after inserting key 98', () => {
      const t = new SplayTree<number, number>();
      t.insert(98, 98);
      expect(t.has(98)).toBe(true);
    });
    it('has returns true after inserting key 99', () => {
      const t = new SplayTree<number, number>();
      t.insert(99, 99);
      expect(t.has(99)).toBe(true);
    });
  });

  describe('delete', () => {
    it('deletes key 0 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(0, 0);
      expect(t.delete(0)).toBe(true);
      expect(t.has(0)).toBe(false);
    });
    it('deletes key 1 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(1, 1);
      expect(t.delete(1)).toBe(true);
      expect(t.has(1)).toBe(false);
    });
    it('deletes key 2 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(2, 2);
      expect(t.delete(2)).toBe(true);
      expect(t.has(2)).toBe(false);
    });
    it('deletes key 3 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(3, 3);
      expect(t.delete(3)).toBe(true);
      expect(t.has(3)).toBe(false);
    });
    it('deletes key 4 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(4, 4);
      expect(t.delete(4)).toBe(true);
      expect(t.has(4)).toBe(false);
    });
    it('deletes key 5 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(5, 5);
      expect(t.delete(5)).toBe(true);
      expect(t.has(5)).toBe(false);
    });
    it('deletes key 6 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(6, 6);
      expect(t.delete(6)).toBe(true);
      expect(t.has(6)).toBe(false);
    });
    it('deletes key 7 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(7, 7);
      expect(t.delete(7)).toBe(true);
      expect(t.has(7)).toBe(false);
    });
    it('deletes key 8 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(8, 8);
      expect(t.delete(8)).toBe(true);
      expect(t.has(8)).toBe(false);
    });
    it('deletes key 9 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(9, 9);
      expect(t.delete(9)).toBe(true);
      expect(t.has(9)).toBe(false);
    });
    it('deletes key 10 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(10, 10);
      expect(t.delete(10)).toBe(true);
      expect(t.has(10)).toBe(false);
    });
    it('deletes key 11 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(11, 11);
      expect(t.delete(11)).toBe(true);
      expect(t.has(11)).toBe(false);
    });
    it('deletes key 12 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(12, 12);
      expect(t.delete(12)).toBe(true);
      expect(t.has(12)).toBe(false);
    });
    it('deletes key 13 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(13, 13);
      expect(t.delete(13)).toBe(true);
      expect(t.has(13)).toBe(false);
    });
    it('deletes key 14 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(14, 14);
      expect(t.delete(14)).toBe(true);
      expect(t.has(14)).toBe(false);
    });
    it('deletes key 15 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(15, 15);
      expect(t.delete(15)).toBe(true);
      expect(t.has(15)).toBe(false);
    });
    it('deletes key 16 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(16, 16);
      expect(t.delete(16)).toBe(true);
      expect(t.has(16)).toBe(false);
    });
    it('deletes key 17 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(17, 17);
      expect(t.delete(17)).toBe(true);
      expect(t.has(17)).toBe(false);
    });
    it('deletes key 18 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(18, 18);
      expect(t.delete(18)).toBe(true);
      expect(t.has(18)).toBe(false);
    });
    it('deletes key 19 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(19, 19);
      expect(t.delete(19)).toBe(true);
      expect(t.has(19)).toBe(false);
    });
    it('deletes key 20 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(20, 20);
      expect(t.delete(20)).toBe(true);
      expect(t.has(20)).toBe(false);
    });
    it('deletes key 21 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(21, 21);
      expect(t.delete(21)).toBe(true);
      expect(t.has(21)).toBe(false);
    });
    it('deletes key 22 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(22, 22);
      expect(t.delete(22)).toBe(true);
      expect(t.has(22)).toBe(false);
    });
    it('deletes key 23 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(23, 23);
      expect(t.delete(23)).toBe(true);
      expect(t.has(23)).toBe(false);
    });
    it('deletes key 24 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(24, 24);
      expect(t.delete(24)).toBe(true);
      expect(t.has(24)).toBe(false);
    });
    it('deletes key 25 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(25, 25);
      expect(t.delete(25)).toBe(true);
      expect(t.has(25)).toBe(false);
    });
    it('deletes key 26 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(26, 26);
      expect(t.delete(26)).toBe(true);
      expect(t.has(26)).toBe(false);
    });
    it('deletes key 27 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(27, 27);
      expect(t.delete(27)).toBe(true);
      expect(t.has(27)).toBe(false);
    });
    it('deletes key 28 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(28, 28);
      expect(t.delete(28)).toBe(true);
      expect(t.has(28)).toBe(false);
    });
    it('deletes key 29 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(29, 29);
      expect(t.delete(29)).toBe(true);
      expect(t.has(29)).toBe(false);
    });
    it('deletes key 30 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(30, 30);
      expect(t.delete(30)).toBe(true);
      expect(t.has(30)).toBe(false);
    });
    it('deletes key 31 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(31, 31);
      expect(t.delete(31)).toBe(true);
      expect(t.has(31)).toBe(false);
    });
    it('deletes key 32 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(32, 32);
      expect(t.delete(32)).toBe(true);
      expect(t.has(32)).toBe(false);
    });
    it('deletes key 33 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(33, 33);
      expect(t.delete(33)).toBe(true);
      expect(t.has(33)).toBe(false);
    });
    it('deletes key 34 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(34, 34);
      expect(t.delete(34)).toBe(true);
      expect(t.has(34)).toBe(false);
    });
    it('deletes key 35 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(35, 35);
      expect(t.delete(35)).toBe(true);
      expect(t.has(35)).toBe(false);
    });
    it('deletes key 36 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(36, 36);
      expect(t.delete(36)).toBe(true);
      expect(t.has(36)).toBe(false);
    });
    it('deletes key 37 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(37, 37);
      expect(t.delete(37)).toBe(true);
      expect(t.has(37)).toBe(false);
    });
    it('deletes key 38 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(38, 38);
      expect(t.delete(38)).toBe(true);
      expect(t.has(38)).toBe(false);
    });
    it('deletes key 39 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(39, 39);
      expect(t.delete(39)).toBe(true);
      expect(t.has(39)).toBe(false);
    });
    it('deletes key 40 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(40, 40);
      expect(t.delete(40)).toBe(true);
      expect(t.has(40)).toBe(false);
    });
    it('deletes key 41 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(41, 41);
      expect(t.delete(41)).toBe(true);
      expect(t.has(41)).toBe(false);
    });
    it('deletes key 42 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(42, 42);
      expect(t.delete(42)).toBe(true);
      expect(t.has(42)).toBe(false);
    });
    it('deletes key 43 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(43, 43);
      expect(t.delete(43)).toBe(true);
      expect(t.has(43)).toBe(false);
    });
    it('deletes key 44 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(44, 44);
      expect(t.delete(44)).toBe(true);
      expect(t.has(44)).toBe(false);
    });
    it('deletes key 45 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(45, 45);
      expect(t.delete(45)).toBe(true);
      expect(t.has(45)).toBe(false);
    });
    it('deletes key 46 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(46, 46);
      expect(t.delete(46)).toBe(true);
      expect(t.has(46)).toBe(false);
    });
    it('deletes key 47 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(47, 47);
      expect(t.delete(47)).toBe(true);
      expect(t.has(47)).toBe(false);
    });
    it('deletes key 48 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(48, 48);
      expect(t.delete(48)).toBe(true);
      expect(t.has(48)).toBe(false);
    });
    it('deletes key 49 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(49, 49);
      expect(t.delete(49)).toBe(true);
      expect(t.has(49)).toBe(false);
    });
    it('deletes key 50 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(50, 50);
      expect(t.delete(50)).toBe(true);
      expect(t.has(50)).toBe(false);
    });
    it('deletes key 51 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(51, 51);
      expect(t.delete(51)).toBe(true);
      expect(t.has(51)).toBe(false);
    });
    it('deletes key 52 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(52, 52);
      expect(t.delete(52)).toBe(true);
      expect(t.has(52)).toBe(false);
    });
    it('deletes key 53 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(53, 53);
      expect(t.delete(53)).toBe(true);
      expect(t.has(53)).toBe(false);
    });
    it('deletes key 54 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(54, 54);
      expect(t.delete(54)).toBe(true);
      expect(t.has(54)).toBe(false);
    });
    it('deletes key 55 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(55, 55);
      expect(t.delete(55)).toBe(true);
      expect(t.has(55)).toBe(false);
    });
    it('deletes key 56 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(56, 56);
      expect(t.delete(56)).toBe(true);
      expect(t.has(56)).toBe(false);
    });
    it('deletes key 57 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(57, 57);
      expect(t.delete(57)).toBe(true);
      expect(t.has(57)).toBe(false);
    });
    it('deletes key 58 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(58, 58);
      expect(t.delete(58)).toBe(true);
      expect(t.has(58)).toBe(false);
    });
    it('deletes key 59 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(59, 59);
      expect(t.delete(59)).toBe(true);
      expect(t.has(59)).toBe(false);
    });
    it('deletes key 60 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(60, 60);
      expect(t.delete(60)).toBe(true);
      expect(t.has(60)).toBe(false);
    });
    it('deletes key 61 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(61, 61);
      expect(t.delete(61)).toBe(true);
      expect(t.has(61)).toBe(false);
    });
    it('deletes key 62 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(62, 62);
      expect(t.delete(62)).toBe(true);
      expect(t.has(62)).toBe(false);
    });
    it('deletes key 63 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(63, 63);
      expect(t.delete(63)).toBe(true);
      expect(t.has(63)).toBe(false);
    });
    it('deletes key 64 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(64, 64);
      expect(t.delete(64)).toBe(true);
      expect(t.has(64)).toBe(false);
    });
    it('deletes key 65 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(65, 65);
      expect(t.delete(65)).toBe(true);
      expect(t.has(65)).toBe(false);
    });
    it('deletes key 66 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(66, 66);
      expect(t.delete(66)).toBe(true);
      expect(t.has(66)).toBe(false);
    });
    it('deletes key 67 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(67, 67);
      expect(t.delete(67)).toBe(true);
      expect(t.has(67)).toBe(false);
    });
    it('deletes key 68 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(68, 68);
      expect(t.delete(68)).toBe(true);
      expect(t.has(68)).toBe(false);
    });
    it('deletes key 69 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(69, 69);
      expect(t.delete(69)).toBe(true);
      expect(t.has(69)).toBe(false);
    });
    it('deletes key 70 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(70, 70);
      expect(t.delete(70)).toBe(true);
      expect(t.has(70)).toBe(false);
    });
    it('deletes key 71 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(71, 71);
      expect(t.delete(71)).toBe(true);
      expect(t.has(71)).toBe(false);
    });
    it('deletes key 72 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(72, 72);
      expect(t.delete(72)).toBe(true);
      expect(t.has(72)).toBe(false);
    });
    it('deletes key 73 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(73, 73);
      expect(t.delete(73)).toBe(true);
      expect(t.has(73)).toBe(false);
    });
    it('deletes key 74 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(74, 74);
      expect(t.delete(74)).toBe(true);
      expect(t.has(74)).toBe(false);
    });
    it('deletes key 75 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(75, 75);
      expect(t.delete(75)).toBe(true);
      expect(t.has(75)).toBe(false);
    });
    it('deletes key 76 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(76, 76);
      expect(t.delete(76)).toBe(true);
      expect(t.has(76)).toBe(false);
    });
    it('deletes key 77 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(77, 77);
      expect(t.delete(77)).toBe(true);
      expect(t.has(77)).toBe(false);
    });
    it('deletes key 78 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(78, 78);
      expect(t.delete(78)).toBe(true);
      expect(t.has(78)).toBe(false);
    });
    it('deletes key 79 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(79, 79);
      expect(t.delete(79)).toBe(true);
      expect(t.has(79)).toBe(false);
    });
    it('deletes key 80 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(80, 80);
      expect(t.delete(80)).toBe(true);
      expect(t.has(80)).toBe(false);
    });
    it('deletes key 81 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(81, 81);
      expect(t.delete(81)).toBe(true);
      expect(t.has(81)).toBe(false);
    });
    it('deletes key 82 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(82, 82);
      expect(t.delete(82)).toBe(true);
      expect(t.has(82)).toBe(false);
    });
    it('deletes key 83 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(83, 83);
      expect(t.delete(83)).toBe(true);
      expect(t.has(83)).toBe(false);
    });
    it('deletes key 84 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(84, 84);
      expect(t.delete(84)).toBe(true);
      expect(t.has(84)).toBe(false);
    });
    it('deletes key 85 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(85, 85);
      expect(t.delete(85)).toBe(true);
      expect(t.has(85)).toBe(false);
    });
    it('deletes key 86 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(86, 86);
      expect(t.delete(86)).toBe(true);
      expect(t.has(86)).toBe(false);
    });
    it('deletes key 87 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(87, 87);
      expect(t.delete(87)).toBe(true);
      expect(t.has(87)).toBe(false);
    });
    it('deletes key 88 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(88, 88);
      expect(t.delete(88)).toBe(true);
      expect(t.has(88)).toBe(false);
    });
    it('deletes key 89 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(89, 89);
      expect(t.delete(89)).toBe(true);
      expect(t.has(89)).toBe(false);
    });
    it('deletes key 90 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(90, 90);
      expect(t.delete(90)).toBe(true);
      expect(t.has(90)).toBe(false);
    });
    it('deletes key 91 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(91, 91);
      expect(t.delete(91)).toBe(true);
      expect(t.has(91)).toBe(false);
    });
    it('deletes key 92 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(92, 92);
      expect(t.delete(92)).toBe(true);
      expect(t.has(92)).toBe(false);
    });
    it('deletes key 93 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(93, 93);
      expect(t.delete(93)).toBe(true);
      expect(t.has(93)).toBe(false);
    });
    it('deletes key 94 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(94, 94);
      expect(t.delete(94)).toBe(true);
      expect(t.has(94)).toBe(false);
    });
    it('deletes key 95 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(95, 95);
      expect(t.delete(95)).toBe(true);
      expect(t.has(95)).toBe(false);
    });
    it('deletes key 96 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(96, 96);
      expect(t.delete(96)).toBe(true);
      expect(t.has(96)).toBe(false);
    });
    it('deletes key 97 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(97, 97);
      expect(t.delete(97)).toBe(true);
      expect(t.has(97)).toBe(false);
    });
    it('deletes key 98 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(98, 98);
      expect(t.delete(98)).toBe(true);
      expect(t.has(98)).toBe(false);
    });
    it('deletes key 99 and returns true', () => {
      const t = new SplayTree<number, number>();
      t.insert(99, 99);
      expect(t.delete(99)).toBe(true);
      expect(t.has(99)).toBe(false);
    });
  });

  describe('size tracking', () => {
    it('size is 1 after 1 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 1; k++) t.insert(k, k);
      expect(t.size).toBe(1);
    });
    it('size is 2 after 2 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 2; k++) t.insert(k, k);
      expect(t.size).toBe(2);
    });
    it('size is 3 after 3 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 3; k++) t.insert(k, k);
      expect(t.size).toBe(3);
    });
    it('size is 4 after 4 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 4; k++) t.insert(k, k);
      expect(t.size).toBe(4);
    });
    it('size is 5 after 5 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 5; k++) t.insert(k, k);
      expect(t.size).toBe(5);
    });
    it('size is 6 after 6 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 6; k++) t.insert(k, k);
      expect(t.size).toBe(6);
    });
    it('size is 7 after 7 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 7; k++) t.insert(k, k);
      expect(t.size).toBe(7);
    });
    it('size is 8 after 8 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 8; k++) t.insert(k, k);
      expect(t.size).toBe(8);
    });
    it('size is 9 after 9 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 9; k++) t.insert(k, k);
      expect(t.size).toBe(9);
    });
    it('size is 10 after 10 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 10; k++) t.insert(k, k);
      expect(t.size).toBe(10);
    });
    it('size is 11 after 11 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 11; k++) t.insert(k, k);
      expect(t.size).toBe(11);
    });
    it('size is 12 after 12 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 12; k++) t.insert(k, k);
      expect(t.size).toBe(12);
    });
    it('size is 13 after 13 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 13; k++) t.insert(k, k);
      expect(t.size).toBe(13);
    });
    it('size is 14 after 14 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 14; k++) t.insert(k, k);
      expect(t.size).toBe(14);
    });
    it('size is 15 after 15 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 15; k++) t.insert(k, k);
      expect(t.size).toBe(15);
    });
    it('size is 16 after 16 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 16; k++) t.insert(k, k);
      expect(t.size).toBe(16);
    });
    it('size is 17 after 17 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 17; k++) t.insert(k, k);
      expect(t.size).toBe(17);
    });
    it('size is 18 after 18 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 18; k++) t.insert(k, k);
      expect(t.size).toBe(18);
    });
    it('size is 19 after 19 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 19; k++) t.insert(k, k);
      expect(t.size).toBe(19);
    });
    it('size is 20 after 20 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 20; k++) t.insert(k, k);
      expect(t.size).toBe(20);
    });
    it('size is 21 after 21 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 21; k++) t.insert(k, k);
      expect(t.size).toBe(21);
    });
    it('size is 22 after 22 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 22; k++) t.insert(k, k);
      expect(t.size).toBe(22);
    });
    it('size is 23 after 23 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 23; k++) t.insert(k, k);
      expect(t.size).toBe(23);
    });
    it('size is 24 after 24 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 24; k++) t.insert(k, k);
      expect(t.size).toBe(24);
    });
    it('size is 25 after 25 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 25; k++) t.insert(k, k);
      expect(t.size).toBe(25);
    });
    it('size is 26 after 26 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 26; k++) t.insert(k, k);
      expect(t.size).toBe(26);
    });
    it('size is 27 after 27 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 27; k++) t.insert(k, k);
      expect(t.size).toBe(27);
    });
    it('size is 28 after 28 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 28; k++) t.insert(k, k);
      expect(t.size).toBe(28);
    });
    it('size is 29 after 29 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 29; k++) t.insert(k, k);
      expect(t.size).toBe(29);
    });
    it('size is 30 after 30 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 30; k++) t.insert(k, k);
      expect(t.size).toBe(30);
    });
    it('size is 31 after 31 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 31; k++) t.insert(k, k);
      expect(t.size).toBe(31);
    });
    it('size is 32 after 32 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 32; k++) t.insert(k, k);
      expect(t.size).toBe(32);
    });
    it('size is 33 after 33 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 33; k++) t.insert(k, k);
      expect(t.size).toBe(33);
    });
    it('size is 34 after 34 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 34; k++) t.insert(k, k);
      expect(t.size).toBe(34);
    });
    it('size is 35 after 35 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 35; k++) t.insert(k, k);
      expect(t.size).toBe(35);
    });
    it('size is 36 after 36 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 36; k++) t.insert(k, k);
      expect(t.size).toBe(36);
    });
    it('size is 37 after 37 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 37; k++) t.insert(k, k);
      expect(t.size).toBe(37);
    });
    it('size is 38 after 38 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 38; k++) t.insert(k, k);
      expect(t.size).toBe(38);
    });
    it('size is 39 after 39 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 39; k++) t.insert(k, k);
      expect(t.size).toBe(39);
    });
    it('size is 40 after 40 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 40; k++) t.insert(k, k);
      expect(t.size).toBe(40);
    });
    it('size is 41 after 41 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 41; k++) t.insert(k, k);
      expect(t.size).toBe(41);
    });
    it('size is 42 after 42 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 42; k++) t.insert(k, k);
      expect(t.size).toBe(42);
    });
    it('size is 43 after 43 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 43; k++) t.insert(k, k);
      expect(t.size).toBe(43);
    });
    it('size is 44 after 44 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 44; k++) t.insert(k, k);
      expect(t.size).toBe(44);
    });
    it('size is 45 after 45 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 45; k++) t.insert(k, k);
      expect(t.size).toBe(45);
    });
    it('size is 46 after 46 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 46; k++) t.insert(k, k);
      expect(t.size).toBe(46);
    });
    it('size is 47 after 47 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 47; k++) t.insert(k, k);
      expect(t.size).toBe(47);
    });
    it('size is 48 after 48 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 48; k++) t.insert(k, k);
      expect(t.size).toBe(48);
    });
    it('size is 49 after 49 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 49; k++) t.insert(k, k);
      expect(t.size).toBe(49);
    });
    it('size is 50 after 50 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 50; k++) t.insert(k, k);
      expect(t.size).toBe(50);
    });
    it('size is 51 after 51 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 51; k++) t.insert(k, k);
      expect(t.size).toBe(51);
    });
    it('size is 52 after 52 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 52; k++) t.insert(k, k);
      expect(t.size).toBe(52);
    });
    it('size is 53 after 53 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 53; k++) t.insert(k, k);
      expect(t.size).toBe(53);
    });
    it('size is 54 after 54 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 54; k++) t.insert(k, k);
      expect(t.size).toBe(54);
    });
    it('size is 55 after 55 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 55; k++) t.insert(k, k);
      expect(t.size).toBe(55);
    });
    it('size is 56 after 56 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 56; k++) t.insert(k, k);
      expect(t.size).toBe(56);
    });
    it('size is 57 after 57 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 57; k++) t.insert(k, k);
      expect(t.size).toBe(57);
    });
    it('size is 58 after 58 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 58; k++) t.insert(k, k);
      expect(t.size).toBe(58);
    });
    it('size is 59 after 59 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 59; k++) t.insert(k, k);
      expect(t.size).toBe(59);
    });
    it('size is 60 after 60 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 60; k++) t.insert(k, k);
      expect(t.size).toBe(60);
    });
    it('size is 61 after 61 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 61; k++) t.insert(k, k);
      expect(t.size).toBe(61);
    });
    it('size is 62 after 62 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 62; k++) t.insert(k, k);
      expect(t.size).toBe(62);
    });
    it('size is 63 after 63 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 63; k++) t.insert(k, k);
      expect(t.size).toBe(63);
    });
    it('size is 64 after 64 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 64; k++) t.insert(k, k);
      expect(t.size).toBe(64);
    });
    it('size is 65 after 65 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 65; k++) t.insert(k, k);
      expect(t.size).toBe(65);
    });
    it('size is 66 after 66 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 66; k++) t.insert(k, k);
      expect(t.size).toBe(66);
    });
    it('size is 67 after 67 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 67; k++) t.insert(k, k);
      expect(t.size).toBe(67);
    });
    it('size is 68 after 68 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 68; k++) t.insert(k, k);
      expect(t.size).toBe(68);
    });
    it('size is 69 after 69 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 69; k++) t.insert(k, k);
      expect(t.size).toBe(69);
    });
    it('size is 70 after 70 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 70; k++) t.insert(k, k);
      expect(t.size).toBe(70);
    });
    it('size is 71 after 71 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 71; k++) t.insert(k, k);
      expect(t.size).toBe(71);
    });
    it('size is 72 after 72 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 72; k++) t.insert(k, k);
      expect(t.size).toBe(72);
    });
    it('size is 73 after 73 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 73; k++) t.insert(k, k);
      expect(t.size).toBe(73);
    });
    it('size is 74 after 74 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 74; k++) t.insert(k, k);
      expect(t.size).toBe(74);
    });
    it('size is 75 after 75 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 75; k++) t.insert(k, k);
      expect(t.size).toBe(75);
    });
    it('size is 76 after 76 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 76; k++) t.insert(k, k);
      expect(t.size).toBe(76);
    });
    it('size is 77 after 77 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 77; k++) t.insert(k, k);
      expect(t.size).toBe(77);
    });
    it('size is 78 after 78 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 78; k++) t.insert(k, k);
      expect(t.size).toBe(78);
    });
    it('size is 79 after 79 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 79; k++) t.insert(k, k);
      expect(t.size).toBe(79);
    });
    it('size is 80 after 80 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 80; k++) t.insert(k, k);
      expect(t.size).toBe(80);
    });
    it('size is 81 after 81 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 81; k++) t.insert(k, k);
      expect(t.size).toBe(81);
    });
    it('size is 82 after 82 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 82; k++) t.insert(k, k);
      expect(t.size).toBe(82);
    });
    it('size is 83 after 83 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 83; k++) t.insert(k, k);
      expect(t.size).toBe(83);
    });
    it('size is 84 after 84 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 84; k++) t.insert(k, k);
      expect(t.size).toBe(84);
    });
    it('size is 85 after 85 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 85; k++) t.insert(k, k);
      expect(t.size).toBe(85);
    });
    it('size is 86 after 86 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 86; k++) t.insert(k, k);
      expect(t.size).toBe(86);
    });
    it('size is 87 after 87 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 87; k++) t.insert(k, k);
      expect(t.size).toBe(87);
    });
    it('size is 88 after 88 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 88; k++) t.insert(k, k);
      expect(t.size).toBe(88);
    });
    it('size is 89 after 89 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 89; k++) t.insert(k, k);
      expect(t.size).toBe(89);
    });
    it('size is 90 after 90 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 90; k++) t.insert(k, k);
      expect(t.size).toBe(90);
    });
    it('size is 91 after 91 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 91; k++) t.insert(k, k);
      expect(t.size).toBe(91);
    });
    it('size is 92 after 92 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 92; k++) t.insert(k, k);
      expect(t.size).toBe(92);
    });
    it('size is 93 after 93 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 93; k++) t.insert(k, k);
      expect(t.size).toBe(93);
    });
    it('size is 94 after 94 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 94; k++) t.insert(k, k);
      expect(t.size).toBe(94);
    });
    it('size is 95 after 95 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 95; k++) t.insert(k, k);
      expect(t.size).toBe(95);
    });
    it('size is 96 after 96 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 96; k++) t.insert(k, k);
      expect(t.size).toBe(96);
    });
    it('size is 97 after 97 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 97; k++) t.insert(k, k);
      expect(t.size).toBe(97);
    });
    it('size is 98 after 98 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 98; k++) t.insert(k, k);
      expect(t.size).toBe(98);
    });
    it('size is 99 after 99 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 99; k++) t.insert(k, k);
      expect(t.size).toBe(99);
    });
    it('size is 100 after 100 inserts', () => {
      const t = new SplayTree<number, number>();
      for (let k = 0; k < 100; k++) t.insert(k, k);
      expect(t.size).toBe(100);
    });
  });

  describe('inOrder sorted ascending', () => {
    it('inOrder is sorted for 1 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:1},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 2 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:2},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 3 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:3},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 4 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:4},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 5 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:5},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 6 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:6},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 7 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:7},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 8 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:8},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 9 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:9},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 10 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:10},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 11 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:11},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 12 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:12},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 13 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:13},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 14 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:14},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 15 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:15},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 16 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:16},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 17 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:17},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 18 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:18},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 19 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:19},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 20 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:20},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 21 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:21},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 22 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:22},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 23 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:23},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 24 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:24},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 25 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:25},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 26 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:26},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 27 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:27},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 28 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:28},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 29 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:29},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 30 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:30},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 31 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:31},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 32 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:32},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 33 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:33},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 34 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:34},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 35 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:35},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 36 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:36},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 37 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:37},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 38 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:38},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 39 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:39},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 40 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:40},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 41 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:41},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 42 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:42},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 43 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:43},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 44 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:44},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 45 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:45},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 46 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:46},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 47 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:47},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 48 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:48},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 49 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:49},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
    it('inOrder is sorted for 50 elements', () => {
      const t = new SplayTree<number, number>();
      const keys = Array.from({length:50},(_,i)=>i*3+1);
      keys.forEach(k=>t.insert(k,k));
      const r = t.inOrder().map(e=>e.key);
      expect(r).toEqual([...r].sort((a,b)=>a-b));
    });
  });

  describe('min and max single element', () => {
    it('min and max are key 0 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(0, 0);
      expect(t.min()).toEqual({key:0,value:0});
      expect(t.max()).toEqual({key:0,value:0});
    });
    it('min and max are key 1 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(1, 1);
      expect(t.min()).toEqual({key:1,value:1});
      expect(t.max()).toEqual({key:1,value:1});
    });
    it('min and max are key 2 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(2, 2);
      expect(t.min()).toEqual({key:2,value:2});
      expect(t.max()).toEqual({key:2,value:2});
    });
    it('min and max are key 3 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(3, 3);
      expect(t.min()).toEqual({key:3,value:3});
      expect(t.max()).toEqual({key:3,value:3});
    });
    it('min and max are key 4 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(4, 4);
      expect(t.min()).toEqual({key:4,value:4});
      expect(t.max()).toEqual({key:4,value:4});
    });
    it('min and max are key 5 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(5, 5);
      expect(t.min()).toEqual({key:5,value:5});
      expect(t.max()).toEqual({key:5,value:5});
    });
    it('min and max are key 6 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(6, 6);
      expect(t.min()).toEqual({key:6,value:6});
      expect(t.max()).toEqual({key:6,value:6});
    });
    it('min and max are key 7 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(7, 7);
      expect(t.min()).toEqual({key:7,value:7});
      expect(t.max()).toEqual({key:7,value:7});
    });
    it('min and max are key 8 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(8, 8);
      expect(t.min()).toEqual({key:8,value:8});
      expect(t.max()).toEqual({key:8,value:8});
    });
    it('min and max are key 9 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(9, 9);
      expect(t.min()).toEqual({key:9,value:9});
      expect(t.max()).toEqual({key:9,value:9});
    });
    it('min and max are key 10 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(10, 10);
      expect(t.min()).toEqual({key:10,value:10});
      expect(t.max()).toEqual({key:10,value:10});
    });
    it('min and max are key 11 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(11, 11);
      expect(t.min()).toEqual({key:11,value:11});
      expect(t.max()).toEqual({key:11,value:11});
    });
    it('min and max are key 12 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(12, 12);
      expect(t.min()).toEqual({key:12,value:12});
      expect(t.max()).toEqual({key:12,value:12});
    });
    it('min and max are key 13 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(13, 13);
      expect(t.min()).toEqual({key:13,value:13});
      expect(t.max()).toEqual({key:13,value:13});
    });
    it('min and max are key 14 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(14, 14);
      expect(t.min()).toEqual({key:14,value:14});
      expect(t.max()).toEqual({key:14,value:14});
    });
    it('min and max are key 15 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(15, 15);
      expect(t.min()).toEqual({key:15,value:15});
      expect(t.max()).toEqual({key:15,value:15});
    });
    it('min and max are key 16 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(16, 16);
      expect(t.min()).toEqual({key:16,value:16});
      expect(t.max()).toEqual({key:16,value:16});
    });
    it('min and max are key 17 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(17, 17);
      expect(t.min()).toEqual({key:17,value:17});
      expect(t.max()).toEqual({key:17,value:17});
    });
    it('min and max are key 18 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(18, 18);
      expect(t.min()).toEqual({key:18,value:18});
      expect(t.max()).toEqual({key:18,value:18});
    });
    it('min and max are key 19 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(19, 19);
      expect(t.min()).toEqual({key:19,value:19});
      expect(t.max()).toEqual({key:19,value:19});
    });
    it('min and max are key 20 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(20, 20);
      expect(t.min()).toEqual({key:20,value:20});
      expect(t.max()).toEqual({key:20,value:20});
    });
    it('min and max are key 21 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(21, 21);
      expect(t.min()).toEqual({key:21,value:21});
      expect(t.max()).toEqual({key:21,value:21});
    });
    it('min and max are key 22 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(22, 22);
      expect(t.min()).toEqual({key:22,value:22});
      expect(t.max()).toEqual({key:22,value:22});
    });
    it('min and max are key 23 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(23, 23);
      expect(t.min()).toEqual({key:23,value:23});
      expect(t.max()).toEqual({key:23,value:23});
    });
    it('min and max are key 24 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(24, 24);
      expect(t.min()).toEqual({key:24,value:24});
      expect(t.max()).toEqual({key:24,value:24});
    });
    it('min and max are key 25 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(25, 25);
      expect(t.min()).toEqual({key:25,value:25});
      expect(t.max()).toEqual({key:25,value:25});
    });
    it('min and max are key 26 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(26, 26);
      expect(t.min()).toEqual({key:26,value:26});
      expect(t.max()).toEqual({key:26,value:26});
    });
    it('min and max are key 27 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(27, 27);
      expect(t.min()).toEqual({key:27,value:27});
      expect(t.max()).toEqual({key:27,value:27});
    });
    it('min and max are key 28 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(28, 28);
      expect(t.min()).toEqual({key:28,value:28});
      expect(t.max()).toEqual({key:28,value:28});
    });
    it('min and max are key 29 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(29, 29);
      expect(t.min()).toEqual({key:29,value:29});
      expect(t.max()).toEqual({key:29,value:29});
    });
    it('min and max are key 30 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(30, 30);
      expect(t.min()).toEqual({key:30,value:30});
      expect(t.max()).toEqual({key:30,value:30});
    });
    it('min and max are key 31 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(31, 31);
      expect(t.min()).toEqual({key:31,value:31});
      expect(t.max()).toEqual({key:31,value:31});
    });
    it('min and max are key 32 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(32, 32);
      expect(t.min()).toEqual({key:32,value:32});
      expect(t.max()).toEqual({key:32,value:32});
    });
    it('min and max are key 33 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(33, 33);
      expect(t.min()).toEqual({key:33,value:33});
      expect(t.max()).toEqual({key:33,value:33});
    });
    it('min and max are key 34 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(34, 34);
      expect(t.min()).toEqual({key:34,value:34});
      expect(t.max()).toEqual({key:34,value:34});
    });
    it('min and max are key 35 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(35, 35);
      expect(t.min()).toEqual({key:35,value:35});
      expect(t.max()).toEqual({key:35,value:35});
    });
    it('min and max are key 36 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(36, 36);
      expect(t.min()).toEqual({key:36,value:36});
      expect(t.max()).toEqual({key:36,value:36});
    });
    it('min and max are key 37 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(37, 37);
      expect(t.min()).toEqual({key:37,value:37});
      expect(t.max()).toEqual({key:37,value:37});
    });
    it('min and max are key 38 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(38, 38);
      expect(t.min()).toEqual({key:38,value:38});
      expect(t.max()).toEqual({key:38,value:38});
    });
    it('min and max are key 39 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(39, 39);
      expect(t.min()).toEqual({key:39,value:39});
      expect(t.max()).toEqual({key:39,value:39});
    });
    it('min and max are key 40 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(40, 40);
      expect(t.min()).toEqual({key:40,value:40});
      expect(t.max()).toEqual({key:40,value:40});
    });
    it('min and max are key 41 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(41, 41);
      expect(t.min()).toEqual({key:41,value:41});
      expect(t.max()).toEqual({key:41,value:41});
    });
    it('min and max are key 42 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(42, 42);
      expect(t.min()).toEqual({key:42,value:42});
      expect(t.max()).toEqual({key:42,value:42});
    });
    it('min and max are key 43 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(43, 43);
      expect(t.min()).toEqual({key:43,value:43});
      expect(t.max()).toEqual({key:43,value:43});
    });
    it('min and max are key 44 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(44, 44);
      expect(t.min()).toEqual({key:44,value:44});
      expect(t.max()).toEqual({key:44,value:44});
    });
    it('min and max are key 45 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(45, 45);
      expect(t.min()).toEqual({key:45,value:45});
      expect(t.max()).toEqual({key:45,value:45});
    });
    it('min and max are key 46 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(46, 46);
      expect(t.min()).toEqual({key:46,value:46});
      expect(t.max()).toEqual({key:46,value:46});
    });
    it('min and max are key 47 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(47, 47);
      expect(t.min()).toEqual({key:47,value:47});
      expect(t.max()).toEqual({key:47,value:47});
    });
    it('min and max are key 48 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(48, 48);
      expect(t.min()).toEqual({key:48,value:48});
      expect(t.max()).toEqual({key:48,value:48});
    });
    it('min and max are key 49 for single-element tree', () => {
      const t = new SplayTree<number, number>();
      t.insert(49, 49);
      expect(t.min()).toEqual({key:49,value:49});
      expect(t.max()).toEqual({key:49,value:49});
    });
  });

  describe('min and max multi-element', () => {
    it('min=0 max=1 in tree of 2 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<2;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(2-1);
    });
    it('min=0 max=2 in tree of 3 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<3;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(3-1);
    });
    it('min=0 max=3 in tree of 4 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<4;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(4-1);
    });
    it('min=0 max=4 in tree of 5 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<5;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(5-1);
    });
    it('min=0 max=5 in tree of 6 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<6;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(6-1);
    });
    it('min=0 max=6 in tree of 7 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<7;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(7-1);
    });
    it('min=0 max=7 in tree of 8 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<8;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(8-1);
    });
    it('min=0 max=8 in tree of 9 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<9;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(9-1);
    });
    it('min=0 max=9 in tree of 10 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<10;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(10-1);
    });
    it('min=0 max=10 in tree of 11 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<11;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(11-1);
    });
    it('min=0 max=11 in tree of 12 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<12;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(12-1);
    });
    it('min=0 max=12 in tree of 13 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<13;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(13-1);
    });
    it('min=0 max=13 in tree of 14 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<14;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(14-1);
    });
    it('min=0 max=14 in tree of 15 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<15;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(15-1);
    });
    it('min=0 max=15 in tree of 16 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<16;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(16-1);
    });
    it('min=0 max=16 in tree of 17 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<17;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(17-1);
    });
    it('min=0 max=17 in tree of 18 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<18;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(18-1);
    });
    it('min=0 max=18 in tree of 19 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<19;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(19-1);
    });
    it('min=0 max=19 in tree of 20 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<20;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(20-1);
    });
    it('min=0 max=20 in tree of 21 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<21;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(21-1);
    });
    it('min=0 max=21 in tree of 22 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<22;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(22-1);
    });
    it('min=0 max=22 in tree of 23 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<23;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(23-1);
    });
    it('min=0 max=23 in tree of 24 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<24;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(24-1);
    });
    it('min=0 max=24 in tree of 25 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<25;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(25-1);
    });
    it('min=0 max=25 in tree of 26 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<26;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(26-1);
    });
    it('min=0 max=26 in tree of 27 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<27;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(27-1);
    });
    it('min=0 max=27 in tree of 28 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<28;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(28-1);
    });
    it('min=0 max=28 in tree of 29 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<29;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(29-1);
    });
    it('min=0 max=29 in tree of 30 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<30;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(30-1);
    });
    it('min=0 max=30 in tree of 31 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<31;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(31-1);
    });
    it('min=0 max=31 in tree of 32 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<32;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(32-1);
    });
    it('min=0 max=32 in tree of 33 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<33;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(33-1);
    });
    it('min=0 max=33 in tree of 34 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<34;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(34-1);
    });
    it('min=0 max=34 in tree of 35 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<35;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(35-1);
    });
    it('min=0 max=35 in tree of 36 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<36;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(36-1);
    });
    it('min=0 max=36 in tree of 37 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<37;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(37-1);
    });
    it('min=0 max=37 in tree of 38 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<38;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(38-1);
    });
    it('min=0 max=38 in tree of 39 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<39;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(39-1);
    });
    it('min=0 max=39 in tree of 40 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<40;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(40-1);
    });
    it('min=0 max=40 in tree of 41 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<41;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(41-1);
    });
    it('min=0 max=41 in tree of 42 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<42;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(42-1);
    });
    it('min=0 max=42 in tree of 43 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<43;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(43-1);
    });
    it('min=0 max=43 in tree of 44 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<44;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(44-1);
    });
    it('min=0 max=44 in tree of 45 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<45;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(45-1);
    });
    it('min=0 max=45 in tree of 46 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<46;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(46-1);
    });
    it('min=0 max=46 in tree of 47 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<47;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(47-1);
    });
    it('min=0 max=47 in tree of 48 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<48;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(48-1);
    });
    it('min=0 max=48 in tree of 49 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<49;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(49-1);
    });
    it('min=0 max=49 in tree of 50 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<50;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(50-1);
    });
    it('min=0 max=50 in tree of 51 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<51;k++) t.insert(k,k);
      expect(t.min()!.key).toBe(0);
      expect(t.max()!.key).toBe(51-1);
    });
  });

  describe('rangeQuery', () => {
    it('rangeQuery [lo,lo+4] with lo=0', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(0, 0+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(0);
    });
    it('rangeQuery [lo,lo+4] with lo=1', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(1, 1+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(1);
    });
    it('rangeQuery [lo,lo+4] with lo=2', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(2, 2+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(2);
    });
    it('rangeQuery [lo,lo+4] with lo=3', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(3, 3+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(3);
    });
    it('rangeQuery [lo,lo+4] with lo=4', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(4, 4+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(4);
    });
    it('rangeQuery [lo,lo+4] with lo=5', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(5, 5+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(5);
    });
    it('rangeQuery [lo,lo+4] with lo=6', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(6, 6+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(6);
    });
    it('rangeQuery [lo,lo+4] with lo=7', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(7, 7+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(7);
    });
    it('rangeQuery [lo,lo+4] with lo=8', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(8, 8+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(8);
    });
    it('rangeQuery [lo,lo+4] with lo=9', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(9, 9+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(9);
    });
    it('rangeQuery [lo,lo+4] with lo=10', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(10, 10+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(10);
    });
    it('rangeQuery [lo,lo+4] with lo=11', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(11, 11+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(11);
    });
    it('rangeQuery [lo,lo+4] with lo=12', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(12, 12+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(12);
    });
    it('rangeQuery [lo,lo+4] with lo=13', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(13, 13+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(13);
    });
    it('rangeQuery [lo,lo+4] with lo=14', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(14, 14+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(14);
    });
    it('rangeQuery [lo,lo+4] with lo=15', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(15, 15+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(15);
    });
    it('rangeQuery [lo,lo+4] with lo=16', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(16, 16+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(16);
    });
    it('rangeQuery [lo,lo+4] with lo=17', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(17, 17+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(17);
    });
    it('rangeQuery [lo,lo+4] with lo=18', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(18, 18+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(18);
    });
    it('rangeQuery [lo,lo+4] with lo=19', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(19, 19+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(19);
    });
    it('rangeQuery [lo,lo+4] with lo=20', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(20, 20+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(20);
    });
    it('rangeQuery [lo,lo+4] with lo=21', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(21, 21+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(21);
    });
    it('rangeQuery [lo,lo+4] with lo=22', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(22, 22+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(22);
    });
    it('rangeQuery [lo,lo+4] with lo=23', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(23, 23+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(23);
    });
    it('rangeQuery [lo,lo+4] with lo=24', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(24, 24+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(24);
    });
    it('rangeQuery [lo,lo+4] with lo=25', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(25, 25+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(25);
    });
    it('rangeQuery [lo,lo+4] with lo=26', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(26, 26+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(26);
    });
    it('rangeQuery [lo,lo+4] with lo=27', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(27, 27+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(27);
    });
    it('rangeQuery [lo,lo+4] with lo=28', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(28, 28+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(28);
    });
    it('rangeQuery [lo,lo+4] with lo=29', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(29, 29+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(29);
    });
    it('rangeQuery [lo,lo+4] with lo=30', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(30, 30+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(30);
    });
    it('rangeQuery [lo,lo+4] with lo=31', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(31, 31+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(31);
    });
    it('rangeQuery [lo,lo+4] with lo=32', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(32, 32+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(32);
    });
    it('rangeQuery [lo,lo+4] with lo=33', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(33, 33+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(33);
    });
    it('rangeQuery [lo,lo+4] with lo=34', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(34, 34+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(34);
    });
    it('rangeQuery [lo,lo+4] with lo=35', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(35, 35+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(35);
    });
    it('rangeQuery [lo,lo+4] with lo=36', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(36, 36+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(36);
    });
    it('rangeQuery [lo,lo+4] with lo=37', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(37, 37+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(37);
    });
    it('rangeQuery [lo,lo+4] with lo=38', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(38, 38+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(38);
    });
    it('rangeQuery [lo,lo+4] with lo=39', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(39, 39+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(39);
    });
    it('rangeQuery [lo,lo+4] with lo=40', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(40, 40+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(40);
    });
    it('rangeQuery [lo,lo+4] with lo=41', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(41, 41+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(41);
    });
    it('rangeQuery [lo,lo+4] with lo=42', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(42, 42+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(42);
    });
    it('rangeQuery [lo,lo+4] with lo=43', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(43, 43+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(43);
    });
    it('rangeQuery [lo,lo+4] with lo=44', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(44, 44+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(44);
    });
    it('rangeQuery [lo,lo+4] with lo=45', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(45, 45+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(45);
    });
    it('rangeQuery [lo,lo+4] with lo=46', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(46, 46+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(46);
    });
    it('rangeQuery [lo,lo+4] with lo=47', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(47, 47+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(47);
    });
    it('rangeQuery [lo,lo+4] with lo=48', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(48, 48+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(48);
    });
    it('rangeQuery [lo,lo+4] with lo=49', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(49, 49+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(49);
    });
    it('rangeQuery [lo,lo+4] with lo=50', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(50, 50+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(50);
    });
    it('rangeQuery [lo,lo+4] with lo=51', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(51, 51+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(51);
    });
    it('rangeQuery [lo,lo+4] with lo=52', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(52, 52+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(52);
    });
    it('rangeQuery [lo,lo+4] with lo=53', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(53, 53+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(53);
    });
    it('rangeQuery [lo,lo+4] with lo=54', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(54, 54+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(54);
    });
    it('rangeQuery [lo,lo+4] with lo=55', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(55, 55+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(55);
    });
    it('rangeQuery [lo,lo+4] with lo=56', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(56, 56+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(56);
    });
    it('rangeQuery [lo,lo+4] with lo=57', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(57, 57+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(57);
    });
    it('rangeQuery [lo,lo+4] with lo=58', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(58, 58+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(58);
    });
    it('rangeQuery [lo,lo+4] with lo=59', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(59, 59+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(59);
    });
    it('rangeQuery [lo,lo+4] with lo=60', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(60, 60+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(60);
    });
    it('rangeQuery [lo,lo+4] with lo=61', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(61, 61+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(61);
    });
    it('rangeQuery [lo,lo+4] with lo=62', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(62, 62+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(62);
    });
    it('rangeQuery [lo,lo+4] with lo=63', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(63, 63+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(63);
    });
    it('rangeQuery [lo,lo+4] with lo=64', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(64, 64+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(64);
    });
    it('rangeQuery [lo,lo+4] with lo=65', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(65, 65+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(65);
    });
    it('rangeQuery [lo,lo+4] with lo=66', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(66, 66+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(66);
    });
    it('rangeQuery [lo,lo+4] with lo=67', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(67, 67+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(67);
    });
    it('rangeQuery [lo,lo+4] with lo=68', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(68, 68+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(68);
    });
    it('rangeQuery [lo,lo+4] with lo=69', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(69, 69+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(69);
    });
    it('rangeQuery [lo,lo+4] with lo=70', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(70, 70+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(70);
    });
    it('rangeQuery [lo,lo+4] with lo=71', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(71, 71+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(71);
    });
    it('rangeQuery [lo,lo+4] with lo=72', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(72, 72+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(72);
    });
    it('rangeQuery [lo,lo+4] with lo=73', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(73, 73+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(73);
    });
    it('rangeQuery [lo,lo+4] with lo=74', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(74, 74+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(74);
    });
    it('rangeQuery [lo,lo+4] with lo=75', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(75, 75+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(75);
    });
    it('rangeQuery [lo,lo+4] with lo=76', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(76, 76+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(76);
    });
    it('rangeQuery [lo,lo+4] with lo=77', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(77, 77+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(77);
    });
    it('rangeQuery [lo,lo+4] with lo=78', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(78, 78+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(78);
    });
    it('rangeQuery [lo,lo+4] with lo=79', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(79, 79+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(79);
    });
    it('rangeQuery [lo,lo+4] with lo=80', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(80, 80+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(80);
    });
    it('rangeQuery [lo,lo+4] with lo=81', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(81, 81+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(81);
    });
    it('rangeQuery [lo,lo+4] with lo=82', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(82, 82+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(82);
    });
    it('rangeQuery [lo,lo+4] with lo=83', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(83, 83+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(83);
    });
    it('rangeQuery [lo,lo+4] with lo=84', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(84, 84+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(84);
    });
    it('rangeQuery [lo,lo+4] with lo=85', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(85, 85+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(85);
    });
    it('rangeQuery [lo,lo+4] with lo=86', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(86, 86+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(86);
    });
    it('rangeQuery [lo,lo+4] with lo=87', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(87, 87+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(87);
    });
    it('rangeQuery [lo,lo+4] with lo=88', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(88, 88+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(88);
    });
    it('rangeQuery [lo,lo+4] with lo=89', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(89, 89+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(89);
    });
    it('rangeQuery [lo,lo+4] with lo=90', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(90, 90+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(90);
    });
    it('rangeQuery [lo,lo+4] with lo=91', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(91, 91+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(91);
    });
    it('rangeQuery [lo,lo+4] with lo=92', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(92, 92+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(92);
    });
    it('rangeQuery [lo,lo+4] with lo=93', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(93, 93+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(93);
    });
    it('rangeQuery [lo,lo+4] with lo=94', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(94, 94+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(94);
    });
    it('rangeQuery [lo,lo+4] with lo=95', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(95, 95+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(95);
    });
    it('rangeQuery [lo,lo+4] with lo=96', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(96, 96+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(96);
    });
    it('rangeQuery [lo,lo+4] with lo=97', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(97, 97+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(97);
    });
    it('rangeQuery [lo,lo+4] with lo=98', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(98, 98+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(98);
    });
    it('rangeQuery [lo,lo+4] with lo=99', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<200;k++) t.insert(k,k*2);
      const r = t.rangeQuery(99, 99+4);
      expect(r.length).toBe(5);
      expect(r[0].key).toBe(99);
    });
  });

  describe('clear', () => {
    it('clear resets tree of 1 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<1;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 2 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<2;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 3 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<3;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 4 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<4;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 5 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<5;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 6 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<6;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 7 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<7;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 8 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<8;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 9 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<9;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 10 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<10;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 11 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<11;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 12 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<12;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 13 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<13;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 14 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<14;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 15 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<15;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 16 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<16;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 17 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<17;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 18 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<18;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 19 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<19;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 20 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<20;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 21 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<21;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 22 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<22;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 23 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<23;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 24 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<24;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 25 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<25;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 26 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<26;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 27 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<27;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 28 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<28;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 29 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<29;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 30 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<30;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 31 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<31;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 32 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<32;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 33 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<33;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 34 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<34;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 35 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<35;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 36 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<36;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 37 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<37;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 38 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<38;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 39 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<39;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 40 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<40;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 41 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<41;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 42 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<42;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 43 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<43;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 44 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<44;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 45 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<45;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 46 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<46;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 47 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<47;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 48 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<48;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 49 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<49;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
    it('clear resets tree of 50 elements', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<50;k++) t.insert(k,k);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.find(0)).toBeUndefined();
    });
  });

  describe('split sizes add up', () => {
    it('split of 2 elements sizes sum to 2', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<2;k++) t.insert(k*2,k);
      const [L,R] = t.split(2-1);
      expect(L.size + R.size).toBe(2);
    });
    it('split of 3 elements sizes sum to 3', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<3;k++) t.insert(k*2,k);
      const [L,R] = t.split(3-1);
      expect(L.size + R.size).toBe(3);
    });
    it('split of 4 elements sizes sum to 4', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<4;k++) t.insert(k*2,k);
      const [L,R] = t.split(4-1);
      expect(L.size + R.size).toBe(4);
    });
    it('split of 5 elements sizes sum to 5', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<5;k++) t.insert(k*2,k);
      const [L,R] = t.split(5-1);
      expect(L.size + R.size).toBe(5);
    });
    it('split of 6 elements sizes sum to 6', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<6;k++) t.insert(k*2,k);
      const [L,R] = t.split(6-1);
      expect(L.size + R.size).toBe(6);
    });
    it('split of 7 elements sizes sum to 7', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<7;k++) t.insert(k*2,k);
      const [L,R] = t.split(7-1);
      expect(L.size + R.size).toBe(7);
    });
    it('split of 8 elements sizes sum to 8', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<8;k++) t.insert(k*2,k);
      const [L,R] = t.split(8-1);
      expect(L.size + R.size).toBe(8);
    });
    it('split of 9 elements sizes sum to 9', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<9;k++) t.insert(k*2,k);
      const [L,R] = t.split(9-1);
      expect(L.size + R.size).toBe(9);
    });
    it('split of 10 elements sizes sum to 10', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<10;k++) t.insert(k*2,k);
      const [L,R] = t.split(10-1);
      expect(L.size + R.size).toBe(10);
    });
    it('split of 11 elements sizes sum to 11', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<11;k++) t.insert(k*2,k);
      const [L,R] = t.split(11-1);
      expect(L.size + R.size).toBe(11);
    });
    it('split of 12 elements sizes sum to 12', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<12;k++) t.insert(k*2,k);
      const [L,R] = t.split(12-1);
      expect(L.size + R.size).toBe(12);
    });
    it('split of 13 elements sizes sum to 13', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<13;k++) t.insert(k*2,k);
      const [L,R] = t.split(13-1);
      expect(L.size + R.size).toBe(13);
    });
    it('split of 14 elements sizes sum to 14', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<14;k++) t.insert(k*2,k);
      const [L,R] = t.split(14-1);
      expect(L.size + R.size).toBe(14);
    });
    it('split of 15 elements sizes sum to 15', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<15;k++) t.insert(k*2,k);
      const [L,R] = t.split(15-1);
      expect(L.size + R.size).toBe(15);
    });
    it('split of 16 elements sizes sum to 16', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<16;k++) t.insert(k*2,k);
      const [L,R] = t.split(16-1);
      expect(L.size + R.size).toBe(16);
    });
    it('split of 17 elements sizes sum to 17', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<17;k++) t.insert(k*2,k);
      const [L,R] = t.split(17-1);
      expect(L.size + R.size).toBe(17);
    });
    it('split of 18 elements sizes sum to 18', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<18;k++) t.insert(k*2,k);
      const [L,R] = t.split(18-1);
      expect(L.size + R.size).toBe(18);
    });
    it('split of 19 elements sizes sum to 19', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<19;k++) t.insert(k*2,k);
      const [L,R] = t.split(19-1);
      expect(L.size + R.size).toBe(19);
    });
    it('split of 20 elements sizes sum to 20', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<20;k++) t.insert(k*2,k);
      const [L,R] = t.split(20-1);
      expect(L.size + R.size).toBe(20);
    });
    it('split of 21 elements sizes sum to 21', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<21;k++) t.insert(k*2,k);
      const [L,R] = t.split(21-1);
      expect(L.size + R.size).toBe(21);
    });
    it('split of 22 elements sizes sum to 22', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<22;k++) t.insert(k*2,k);
      const [L,R] = t.split(22-1);
      expect(L.size + R.size).toBe(22);
    });
    it('split of 23 elements sizes sum to 23', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<23;k++) t.insert(k*2,k);
      const [L,R] = t.split(23-1);
      expect(L.size + R.size).toBe(23);
    });
    it('split of 24 elements sizes sum to 24', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<24;k++) t.insert(k*2,k);
      const [L,R] = t.split(24-1);
      expect(L.size + R.size).toBe(24);
    });
    it('split of 25 elements sizes sum to 25', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<25;k++) t.insert(k*2,k);
      const [L,R] = t.split(25-1);
      expect(L.size + R.size).toBe(25);
    });
    it('split of 26 elements sizes sum to 26', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<26;k++) t.insert(k*2,k);
      const [L,R] = t.split(26-1);
      expect(L.size + R.size).toBe(26);
    });
    it('split of 27 elements sizes sum to 27', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<27;k++) t.insert(k*2,k);
      const [L,R] = t.split(27-1);
      expect(L.size + R.size).toBe(27);
    });
    it('split of 28 elements sizes sum to 28', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<28;k++) t.insert(k*2,k);
      const [L,R] = t.split(28-1);
      expect(L.size + R.size).toBe(28);
    });
    it('split of 29 elements sizes sum to 29', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<29;k++) t.insert(k*2,k);
      const [L,R] = t.split(29-1);
      expect(L.size + R.size).toBe(29);
    });
    it('split of 30 elements sizes sum to 30', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<30;k++) t.insert(k*2,k);
      const [L,R] = t.split(30-1);
      expect(L.size + R.size).toBe(30);
    });
    it('split of 31 elements sizes sum to 31', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<31;k++) t.insert(k*2,k);
      const [L,R] = t.split(31-1);
      expect(L.size + R.size).toBe(31);
    });
    it('split of 32 elements sizes sum to 32', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<32;k++) t.insert(k*2,k);
      const [L,R] = t.split(32-1);
      expect(L.size + R.size).toBe(32);
    });
    it('split of 33 elements sizes sum to 33', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<33;k++) t.insert(k*2,k);
      const [L,R] = t.split(33-1);
      expect(L.size + R.size).toBe(33);
    });
    it('split of 34 elements sizes sum to 34', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<34;k++) t.insert(k*2,k);
      const [L,R] = t.split(34-1);
      expect(L.size + R.size).toBe(34);
    });
    it('split of 35 elements sizes sum to 35', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<35;k++) t.insert(k*2,k);
      const [L,R] = t.split(35-1);
      expect(L.size + R.size).toBe(35);
    });
    it('split of 36 elements sizes sum to 36', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<36;k++) t.insert(k*2,k);
      const [L,R] = t.split(36-1);
      expect(L.size + R.size).toBe(36);
    });
    it('split of 37 elements sizes sum to 37', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<37;k++) t.insert(k*2,k);
      const [L,R] = t.split(37-1);
      expect(L.size + R.size).toBe(37);
    });
    it('split of 38 elements sizes sum to 38', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<38;k++) t.insert(k*2,k);
      const [L,R] = t.split(38-1);
      expect(L.size + R.size).toBe(38);
    });
    it('split of 39 elements sizes sum to 39', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<39;k++) t.insert(k*2,k);
      const [L,R] = t.split(39-1);
      expect(L.size + R.size).toBe(39);
    });
    it('split of 40 elements sizes sum to 40', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<40;k++) t.insert(k*2,k);
      const [L,R] = t.split(40-1);
      expect(L.size + R.size).toBe(40);
    });
    it('split of 41 elements sizes sum to 41', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<41;k++) t.insert(k*2,k);
      const [L,R] = t.split(41-1);
      expect(L.size + R.size).toBe(41);
    });
    it('split of 42 elements sizes sum to 42', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<42;k++) t.insert(k*2,k);
      const [L,R] = t.split(42-1);
      expect(L.size + R.size).toBe(42);
    });
    it('split of 43 elements sizes sum to 43', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<43;k++) t.insert(k*2,k);
      const [L,R] = t.split(43-1);
      expect(L.size + R.size).toBe(43);
    });
    it('split of 44 elements sizes sum to 44', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<44;k++) t.insert(k*2,k);
      const [L,R] = t.split(44-1);
      expect(L.size + R.size).toBe(44);
    });
    it('split of 45 elements sizes sum to 45', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<45;k++) t.insert(k*2,k);
      const [L,R] = t.split(45-1);
      expect(L.size + R.size).toBe(45);
    });
    it('split of 46 elements sizes sum to 46', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<46;k++) t.insert(k*2,k);
      const [L,R] = t.split(46-1);
      expect(L.size + R.size).toBe(46);
    });
    it('split of 47 elements sizes sum to 47', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<47;k++) t.insert(k*2,k);
      const [L,R] = t.split(47-1);
      expect(L.size + R.size).toBe(47);
    });
    it('split of 48 elements sizes sum to 48', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<48;k++) t.insert(k*2,k);
      const [L,R] = t.split(48-1);
      expect(L.size + R.size).toBe(48);
    });
    it('split of 49 elements sizes sum to 49', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<49;k++) t.insert(k*2,k);
      const [L,R] = t.split(49-1);
      expect(L.size + R.size).toBe(49);
    });
    it('split of 50 elements sizes sum to 50', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<50;k++) t.insert(k*2,k);
      const [L,R] = t.split(50-1);
      expect(L.size + R.size).toBe(50);
    });
    it('split of 51 elements sizes sum to 51', () => {
      const t = new SplayTree<number, number>();
      for(let k=0;k<51;k++) t.insert(k*2,k);
      const [L,R] = t.split(51-1);
      expect(L.size + R.size).toBe(51);
    });
  });

  describe('join', () => {
    it('join of two trees with 1 elements each has size 2', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<1;k++) a.insert(k,k);
      for(let k=1;k<2;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(2);
    });
    it('join of two trees with 2 elements each has size 4', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<2;k++) a.insert(k,k);
      for(let k=2;k<4;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(4);
    });
    it('join of two trees with 3 elements each has size 6', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<3;k++) a.insert(k,k);
      for(let k=3;k<6;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(6);
    });
    it('join of two trees with 4 elements each has size 8', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<4;k++) a.insert(k,k);
      for(let k=4;k<8;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(8);
    });
    it('join of two trees with 5 elements each has size 10', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<5;k++) a.insert(k,k);
      for(let k=5;k<10;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(10);
    });
    it('join of two trees with 6 elements each has size 12', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<6;k++) a.insert(k,k);
      for(let k=6;k<12;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(12);
    });
    it('join of two trees with 7 elements each has size 14', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<7;k++) a.insert(k,k);
      for(let k=7;k<14;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(14);
    });
    it('join of two trees with 8 elements each has size 16', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<8;k++) a.insert(k,k);
      for(let k=8;k<16;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(16);
    });
    it('join of two trees with 9 elements each has size 18', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<9;k++) a.insert(k,k);
      for(let k=9;k<18;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(18);
    });
    it('join of two trees with 10 elements each has size 20', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<10;k++) a.insert(k,k);
      for(let k=10;k<20;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(20);
    });
    it('join of two trees with 11 elements each has size 22', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<11;k++) a.insert(k,k);
      for(let k=11;k<22;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(22);
    });
    it('join of two trees with 12 elements each has size 24', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<12;k++) a.insert(k,k);
      for(let k=12;k<24;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(24);
    });
    it('join of two trees with 13 elements each has size 26', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<13;k++) a.insert(k,k);
      for(let k=13;k<26;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(26);
    });
    it('join of two trees with 14 elements each has size 28', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<14;k++) a.insert(k,k);
      for(let k=14;k<28;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(28);
    });
    it('join of two trees with 15 elements each has size 30', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<15;k++) a.insert(k,k);
      for(let k=15;k<30;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(30);
    });
    it('join of two trees with 16 elements each has size 32', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<16;k++) a.insert(k,k);
      for(let k=16;k<32;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(32);
    });
    it('join of two trees with 17 elements each has size 34', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<17;k++) a.insert(k,k);
      for(let k=17;k<34;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(34);
    });
    it('join of two trees with 18 elements each has size 36', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<18;k++) a.insert(k,k);
      for(let k=18;k<36;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(36);
    });
    it('join of two trees with 19 elements each has size 38', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<19;k++) a.insert(k,k);
      for(let k=19;k<38;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(38);
    });
    it('join of two trees with 20 elements each has size 40', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<20;k++) a.insert(k,k);
      for(let k=20;k<40;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(40);
    });
    it('join of two trees with 21 elements each has size 42', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<21;k++) a.insert(k,k);
      for(let k=21;k<42;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(42);
    });
    it('join of two trees with 22 elements each has size 44', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<22;k++) a.insert(k,k);
      for(let k=22;k<44;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(44);
    });
    it('join of two trees with 23 elements each has size 46', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<23;k++) a.insert(k,k);
      for(let k=23;k<46;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(46);
    });
    it('join of two trees with 24 elements each has size 48', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<24;k++) a.insert(k,k);
      for(let k=24;k<48;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(48);
    });
    it('join of two trees with 25 elements each has size 50', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<25;k++) a.insert(k,k);
      for(let k=25;k<50;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(50);
    });
    it('join of two trees with 26 elements each has size 52', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<26;k++) a.insert(k,k);
      for(let k=26;k<52;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(52);
    });
    it('join of two trees with 27 elements each has size 54', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<27;k++) a.insert(k,k);
      for(let k=27;k<54;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(54);
    });
    it('join of two trees with 28 elements each has size 56', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<28;k++) a.insert(k,k);
      for(let k=28;k<56;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(56);
    });
    it('join of two trees with 29 elements each has size 58', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<29;k++) a.insert(k,k);
      for(let k=29;k<58;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(58);
    });
    it('join of two trees with 30 elements each has size 60', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<30;k++) a.insert(k,k);
      for(let k=30;k<60;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(60);
    });
    it('join of two trees with 31 elements each has size 62', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<31;k++) a.insert(k,k);
      for(let k=31;k<62;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(62);
    });
    it('join of two trees with 32 elements each has size 64', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<32;k++) a.insert(k,k);
      for(let k=32;k<64;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(64);
    });
    it('join of two trees with 33 elements each has size 66', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<33;k++) a.insert(k,k);
      for(let k=33;k<66;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(66);
    });
    it('join of two trees with 34 elements each has size 68', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<34;k++) a.insert(k,k);
      for(let k=34;k<68;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(68);
    });
    it('join of two trees with 35 elements each has size 70', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<35;k++) a.insert(k,k);
      for(let k=35;k<70;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(70);
    });
    it('join of two trees with 36 elements each has size 72', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<36;k++) a.insert(k,k);
      for(let k=36;k<72;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(72);
    });
    it('join of two trees with 37 elements each has size 74', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<37;k++) a.insert(k,k);
      for(let k=37;k<74;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(74);
    });
    it('join of two trees with 38 elements each has size 76', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<38;k++) a.insert(k,k);
      for(let k=38;k<76;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(76);
    });
    it('join of two trees with 39 elements each has size 78', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<39;k++) a.insert(k,k);
      for(let k=39;k<78;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(78);
    });
    it('join of two trees with 40 elements each has size 80', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<40;k++) a.insert(k,k);
      for(let k=40;k<80;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(80);
    });
    it('join of two trees with 41 elements each has size 82', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<41;k++) a.insert(k,k);
      for(let k=41;k<82;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(82);
    });
    it('join of two trees with 42 elements each has size 84', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<42;k++) a.insert(k,k);
      for(let k=42;k<84;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(84);
    });
    it('join of two trees with 43 elements each has size 86', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<43;k++) a.insert(k,k);
      for(let k=43;k<86;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(86);
    });
    it('join of two trees with 44 elements each has size 88', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<44;k++) a.insert(k,k);
      for(let k=44;k<88;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(88);
    });
    it('join of two trees with 45 elements each has size 90', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<45;k++) a.insert(k,k);
      for(let k=45;k<90;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(90);
    });
    it('join of two trees with 46 elements each has size 92', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<46;k++) a.insert(k,k);
      for(let k=46;k<92;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(92);
    });
    it('join of two trees with 47 elements each has size 94', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<47;k++) a.insert(k,k);
      for(let k=47;k<94;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(94);
    });
    it('join of two trees with 48 elements each has size 96', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<48;k++) a.insert(k,k);
      for(let k=48;k<96;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(96);
    });
    it('join of two trees with 49 elements each has size 98', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<49;k++) a.insert(k,k);
      for(let k=49;k<98;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(98);
    });
    it('join of two trees with 50 elements each has size 100', () => {
      const a = new SplayTree<number, number>(); const b = new SplayTree<number, number>();
      for(let k=0;k<50;k++) a.insert(k,k);
      for(let k=50;k<100;k++) b.insert(k,k);
      const j = a.join(b);
      expect(j.size).toBe(100);
    });
  });

  describe('custom comparator', () => {
    it('custom descending comparator finds key 0', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(0, 0);
      expect(t.find(0)).toBe(0);
      expect(t.has(0)).toBe(true);
    });
    it('custom descending comparator finds key 1', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(1, 3);
      expect(t.find(1)).toBe(3);
      expect(t.has(1)).toBe(true);
    });
    it('custom descending comparator finds key 2', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(2, 6);
      expect(t.find(2)).toBe(6);
      expect(t.has(2)).toBe(true);
    });
    it('custom descending comparator finds key 3', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(3, 9);
      expect(t.find(3)).toBe(9);
      expect(t.has(3)).toBe(true);
    });
    it('custom descending comparator finds key 4', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(4, 12);
      expect(t.find(4)).toBe(12);
      expect(t.has(4)).toBe(true);
    });
    it('custom descending comparator finds key 5', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(5, 15);
      expect(t.find(5)).toBe(15);
      expect(t.has(5)).toBe(true);
    });
    it('custom descending comparator finds key 6', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(6, 18);
      expect(t.find(6)).toBe(18);
      expect(t.has(6)).toBe(true);
    });
    it('custom descending comparator finds key 7', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(7, 21);
      expect(t.find(7)).toBe(21);
      expect(t.has(7)).toBe(true);
    });
    it('custom descending comparator finds key 8', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(8, 24);
      expect(t.find(8)).toBe(24);
      expect(t.has(8)).toBe(true);
    });
    it('custom descending comparator finds key 9', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(9, 27);
      expect(t.find(9)).toBe(27);
      expect(t.has(9)).toBe(true);
    });
    it('custom descending comparator finds key 10', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(10, 30);
      expect(t.find(10)).toBe(30);
      expect(t.has(10)).toBe(true);
    });
    it('custom descending comparator finds key 11', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(11, 33);
      expect(t.find(11)).toBe(33);
      expect(t.has(11)).toBe(true);
    });
    it('custom descending comparator finds key 12', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(12, 36);
      expect(t.find(12)).toBe(36);
      expect(t.has(12)).toBe(true);
    });
    it('custom descending comparator finds key 13', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(13, 39);
      expect(t.find(13)).toBe(39);
      expect(t.has(13)).toBe(true);
    });
    it('custom descending comparator finds key 14', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(14, 42);
      expect(t.find(14)).toBe(42);
      expect(t.has(14)).toBe(true);
    });
    it('custom descending comparator finds key 15', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(15, 45);
      expect(t.find(15)).toBe(45);
      expect(t.has(15)).toBe(true);
    });
    it('custom descending comparator finds key 16', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(16, 48);
      expect(t.find(16)).toBe(48);
      expect(t.has(16)).toBe(true);
    });
    it('custom descending comparator finds key 17', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(17, 51);
      expect(t.find(17)).toBe(51);
      expect(t.has(17)).toBe(true);
    });
    it('custom descending comparator finds key 18', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(18, 54);
      expect(t.find(18)).toBe(54);
      expect(t.has(18)).toBe(true);
    });
    it('custom descending comparator finds key 19', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(19, 57);
      expect(t.find(19)).toBe(57);
      expect(t.has(19)).toBe(true);
    });
    it('custom descending comparator finds key 20', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(20, 60);
      expect(t.find(20)).toBe(60);
      expect(t.has(20)).toBe(true);
    });
    it('custom descending comparator finds key 21', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(21, 63);
      expect(t.find(21)).toBe(63);
      expect(t.has(21)).toBe(true);
    });
    it('custom descending comparator finds key 22', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(22, 66);
      expect(t.find(22)).toBe(66);
      expect(t.has(22)).toBe(true);
    });
    it('custom descending comparator finds key 23', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(23, 69);
      expect(t.find(23)).toBe(69);
      expect(t.has(23)).toBe(true);
    });
    it('custom descending comparator finds key 24', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(24, 72);
      expect(t.find(24)).toBe(72);
      expect(t.has(24)).toBe(true);
    });
    it('custom descending comparator finds key 25', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(25, 75);
      expect(t.find(25)).toBe(75);
      expect(t.has(25)).toBe(true);
    });
    it('custom descending comparator finds key 26', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(26, 78);
      expect(t.find(26)).toBe(78);
      expect(t.has(26)).toBe(true);
    });
    it('custom descending comparator finds key 27', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(27, 81);
      expect(t.find(27)).toBe(81);
      expect(t.has(27)).toBe(true);
    });
    it('custom descending comparator finds key 28', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(28, 84);
      expect(t.find(28)).toBe(84);
      expect(t.has(28)).toBe(true);
    });
    it('custom descending comparator finds key 29', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(29, 87);
      expect(t.find(29)).toBe(87);
      expect(t.has(29)).toBe(true);
    });
    it('custom descending comparator finds key 30', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(30, 90);
      expect(t.find(30)).toBe(90);
      expect(t.has(30)).toBe(true);
    });
    it('custom descending comparator finds key 31', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(31, 93);
      expect(t.find(31)).toBe(93);
      expect(t.has(31)).toBe(true);
    });
    it('custom descending comparator finds key 32', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(32, 96);
      expect(t.find(32)).toBe(96);
      expect(t.has(32)).toBe(true);
    });
    it('custom descending comparator finds key 33', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(33, 99);
      expect(t.find(33)).toBe(99);
      expect(t.has(33)).toBe(true);
    });
    it('custom descending comparator finds key 34', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(34, 102);
      expect(t.find(34)).toBe(102);
      expect(t.has(34)).toBe(true);
    });
    it('custom descending comparator finds key 35', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(35, 105);
      expect(t.find(35)).toBe(105);
      expect(t.has(35)).toBe(true);
    });
    it('custom descending comparator finds key 36', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(36, 108);
      expect(t.find(36)).toBe(108);
      expect(t.has(36)).toBe(true);
    });
    it('custom descending comparator finds key 37', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(37, 111);
      expect(t.find(37)).toBe(111);
      expect(t.has(37)).toBe(true);
    });
    it('custom descending comparator finds key 38', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(38, 114);
      expect(t.find(38)).toBe(114);
      expect(t.has(38)).toBe(true);
    });
    it('custom descending comparator finds key 39', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(39, 117);
      expect(t.find(39)).toBe(117);
      expect(t.has(39)).toBe(true);
    });
    it('custom descending comparator finds key 40', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(40, 120);
      expect(t.find(40)).toBe(120);
      expect(t.has(40)).toBe(true);
    });
    it('custom descending comparator finds key 41', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(41, 123);
      expect(t.find(41)).toBe(123);
      expect(t.has(41)).toBe(true);
    });
    it('custom descending comparator finds key 42', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(42, 126);
      expect(t.find(42)).toBe(126);
      expect(t.has(42)).toBe(true);
    });
    it('custom descending comparator finds key 43', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(43, 129);
      expect(t.find(43)).toBe(129);
      expect(t.has(43)).toBe(true);
    });
    it('custom descending comparator finds key 44', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(44, 132);
      expect(t.find(44)).toBe(132);
      expect(t.has(44)).toBe(true);
    });
    it('custom descending comparator finds key 45', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(45, 135);
      expect(t.find(45)).toBe(135);
      expect(t.has(45)).toBe(true);
    });
    it('custom descending comparator finds key 46', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(46, 138);
      expect(t.find(46)).toBe(138);
      expect(t.has(46)).toBe(true);
    });
    it('custom descending comparator finds key 47', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(47, 141);
      expect(t.find(47)).toBe(141);
      expect(t.has(47)).toBe(true);
    });
    it('custom descending comparator finds key 48', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(48, 144);
      expect(t.find(48)).toBe(144);
      expect(t.has(48)).toBe(true);
    });
    it('custom descending comparator finds key 49', () => {
      const t = new SplayTree<number, number>((a,b)=>b-a);
      t.insert(49, 147);
      expect(t.find(49)).toBe(147);
      expect(t.has(49)).toBe(true);
    });
  });

});

  describe('delete returns false for missing key', () => {
    it('delete returns false for key 0 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(0)).toBe(false);
    });
    it('delete returns false for key 1 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(1)).toBe(false);
    });
    it('delete returns false for key 2 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(2)).toBe(false);
    });
    it('delete returns false for key 3 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(3)).toBe(false);
    });
    it('delete returns false for key 4 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(4)).toBe(false);
    });
    it('delete returns false for key 5 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(5)).toBe(false);
    });
    it('delete returns false for key 6 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(6)).toBe(false);
    });
    it('delete returns false for key 7 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(7)).toBe(false);
    });
    it('delete returns false for key 8 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(8)).toBe(false);
    });
    it('delete returns false for key 9 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(9)).toBe(false);
    });
    it('delete returns false for key 10 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(10)).toBe(false);
    });
    it('delete returns false for key 11 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(11)).toBe(false);
    });
    it('delete returns false for key 12 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(12)).toBe(false);
    });
    it('delete returns false for key 13 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(13)).toBe(false);
    });
    it('delete returns false for key 14 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(14)).toBe(false);
    });
    it('delete returns false for key 15 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(15)).toBe(false);
    });
    it('delete returns false for key 16 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(16)).toBe(false);
    });
    it('delete returns false for key 17 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(17)).toBe(false);
    });
    it('delete returns false for key 18 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(18)).toBe(false);
    });
    it('delete returns false for key 19 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(19)).toBe(false);
    });
    it('delete returns false for key 20 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(20)).toBe(false);
    });
    it('delete returns false for key 21 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(21)).toBe(false);
    });
    it('delete returns false for key 22 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(22)).toBe(false);
    });
    it('delete returns false for key 23 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(23)).toBe(false);
    });
    it('delete returns false for key 24 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(24)).toBe(false);
    });
    it('delete returns false for key 25 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(25)).toBe(false);
    });
    it('delete returns false for key 26 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(26)).toBe(false);
    });
    it('delete returns false for key 27 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(27)).toBe(false);
    });
    it('delete returns false for key 28 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(28)).toBe(false);
    });
    it('delete returns false for key 29 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(29)).toBe(false);
    });
    it('delete returns false for key 30 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(30)).toBe(false);
    });
    it('delete returns false for key 31 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(31)).toBe(false);
    });
    it('delete returns false for key 32 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(32)).toBe(false);
    });
    it('delete returns false for key 33 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(33)).toBe(false);
    });
    it('delete returns false for key 34 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(34)).toBe(false);
    });
    it('delete returns false for key 35 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(35)).toBe(false);
    });
    it('delete returns false for key 36 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(36)).toBe(false);
    });
    it('delete returns false for key 37 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(37)).toBe(false);
    });
    it('delete returns false for key 38 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(38)).toBe(false);
    });
    it('delete returns false for key 39 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(39)).toBe(false);
    });
    it('delete returns false for key 40 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(40)).toBe(false);
    });
    it('delete returns false for key 41 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(41)).toBe(false);
    });
    it('delete returns false for key 42 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(42)).toBe(false);
    });
    it('delete returns false for key 43 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(43)).toBe(false);
    });
    it('delete returns false for key 44 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(44)).toBe(false);
    });
    it('delete returns false for key 45 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(45)).toBe(false);
    });
    it('delete returns false for key 46 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(46)).toBe(false);
    });
    it('delete returns false for key 47 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(47)).toBe(false);
    });
    it('delete returns false for key 48 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(48)).toBe(false);
    });
    it('delete returns false for key 49 not in tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.delete(49)).toBe(false);
    });
  });

  describe('find returns undefined for missing key', () => {
    it('find returns undefined for key 100 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(100)).toBeUndefined();
    });
    it('find returns undefined for key 101 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(101)).toBeUndefined();
    });
    it('find returns undefined for key 102 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(102)).toBeUndefined();
    });
    it('find returns undefined for key 103 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(103)).toBeUndefined();
    });
    it('find returns undefined for key 104 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(104)).toBeUndefined();
    });
    it('find returns undefined for key 105 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(105)).toBeUndefined();
    });
    it('find returns undefined for key 106 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(106)).toBeUndefined();
    });
    it('find returns undefined for key 107 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(107)).toBeUndefined();
    });
    it('find returns undefined for key 108 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(108)).toBeUndefined();
    });
    it('find returns undefined for key 109 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(109)).toBeUndefined();
    });
    it('find returns undefined for key 110 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(110)).toBeUndefined();
    });
    it('find returns undefined for key 111 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(111)).toBeUndefined();
    });
    it('find returns undefined for key 112 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(112)).toBeUndefined();
    });
    it('find returns undefined for key 113 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(113)).toBeUndefined();
    });
    it('find returns undefined for key 114 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(114)).toBeUndefined();
    });
    it('find returns undefined for key 115 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(115)).toBeUndefined();
    });
    it('find returns undefined for key 116 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(116)).toBeUndefined();
    });
    it('find returns undefined for key 117 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(117)).toBeUndefined();
    });
    it('find returns undefined for key 118 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(118)).toBeUndefined();
    });
    it('find returns undefined for key 119 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(119)).toBeUndefined();
    });
    it('find returns undefined for key 120 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(120)).toBeUndefined();
    });
    it('find returns undefined for key 121 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(121)).toBeUndefined();
    });
    it('find returns undefined for key 122 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(122)).toBeUndefined();
    });
    it('find returns undefined for key 123 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(123)).toBeUndefined();
    });
    it('find returns undefined for key 124 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(124)).toBeUndefined();
    });
    it('find returns undefined for key 125 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(125)).toBeUndefined();
    });
    it('find returns undefined for key 126 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(126)).toBeUndefined();
    });
    it('find returns undefined for key 127 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(127)).toBeUndefined();
    });
    it('find returns undefined for key 128 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(128)).toBeUndefined();
    });
    it('find returns undefined for key 129 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(129)).toBeUndefined();
    });
    it('find returns undefined for key 130 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(130)).toBeUndefined();
    });
    it('find returns undefined for key 131 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(131)).toBeUndefined();
    });
    it('find returns undefined for key 132 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(132)).toBeUndefined();
    });
    it('find returns undefined for key 133 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(133)).toBeUndefined();
    });
    it('find returns undefined for key 134 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(134)).toBeUndefined();
    });
    it('find returns undefined for key 135 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(135)).toBeUndefined();
    });
    it('find returns undefined for key 136 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(136)).toBeUndefined();
    });
    it('find returns undefined for key 137 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(137)).toBeUndefined();
    });
    it('find returns undefined for key 138 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(138)).toBeUndefined();
    });
    it('find returns undefined for key 139 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(139)).toBeUndefined();
    });
    it('find returns undefined for key 140 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(140)).toBeUndefined();
    });
    it('find returns undefined for key 141 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(141)).toBeUndefined();
    });
    it('find returns undefined for key 142 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(142)).toBeUndefined();
    });
    it('find returns undefined for key 143 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(143)).toBeUndefined();
    });
    it('find returns undefined for key 144 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(144)).toBeUndefined();
    });
    it('find returns undefined for key 145 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(145)).toBeUndefined();
    });
    it('find returns undefined for key 146 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(146)).toBeUndefined();
    });
    it('find returns undefined for key 147 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(147)).toBeUndefined();
    });
    it('find returns undefined for key 148 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(148)).toBeUndefined();
    });
    it('find returns undefined for key 149 in empty tree', () => {
      const t = new SplayTree<number, number>();
      expect(t.find(149)).toBeUndefined();
    });
  });

  describe('min and max of empty tree', () => {
    it('min returns null for empty tree (run 0)', () => {
      const t = new SplayTree<number, number>();
      expect(t.min()).toBeNull();
    });
    it('max returns null for empty tree (run 0)', () => {
      const t = new SplayTree<number, number>();
      expect(t.max()).toBeNull();
    });
    it('min returns null for empty tree (run 1)', () => {
      const t = new SplayTree<number, number>();
      expect(t.min()).toBeNull();
    });
    it('max returns null for empty tree (run 1)', () => {
      const t = new SplayTree<number, number>();
      expect(t.max()).toBeNull();
    });
    it('min returns null for empty tree (run 2)', () => {
      const t = new SplayTree<number, number>();
      expect(t.min()).toBeNull();
    });
    it('max returns null for empty tree (run 2)', () => {
      const t = new SplayTree<number, number>();
      expect(t.max()).toBeNull();
    });
    it('min returns null for empty tree (run 3)', () => {
      const t = new SplayTree<number, number>();
      expect(t.min()).toBeNull();
    });
    it('max returns null for empty tree (run 3)', () => {
      const t = new SplayTree<number, number>();
      expect(t.max()).toBeNull();
    });
    it('min returns null for empty tree (run 4)', () => {
      const t = new SplayTree<number, number>();
      expect(t.min()).toBeNull();
    });
    it('max returns null for empty tree (run 4)', () => {
      const t = new SplayTree<number, number>();
      expect(t.max()).toBeNull();
    });
    it('min returns null for empty tree (run 5)', () => {
      const t = new SplayTree<number, number>();
      expect(t.min()).toBeNull();
    });
    it('max returns null for empty tree (run 5)', () => {
      const t = new SplayTree<number, number>();
      expect(t.max()).toBeNull();
    });
    it('min returns null for empty tree (run 6)', () => {
      const t = new SplayTree<number, number>();
      expect(t.min()).toBeNull();
    });
    it('max returns null for empty tree (run 6)', () => {
      const t = new SplayTree<number, number>();
      expect(t.max()).toBeNull();
    });
    it('min returns null for empty tree (run 7)', () => {
      const t = new SplayTree<number, number>();
      expect(t.min()).toBeNull();
    });
    it('max returns null for empty tree (run 7)', () => {
      const t = new SplayTree<number, number>();
      expect(t.max()).toBeNull();
    });
    it('min returns null for empty tree (run 8)', () => {
      const t = new SplayTree<number, number>();
      expect(t.min()).toBeNull();
    });
    it('max returns null for empty tree (run 8)', () => {
      const t = new SplayTree<number, number>();
      expect(t.max()).toBeNull();
    });
    it('min returns null for empty tree (run 9)', () => {
      const t = new SplayTree<number, number>();
      expect(t.min()).toBeNull();
    });
    it('max returns null for empty tree (run 9)', () => {
      const t = new SplayTree<number, number>();
      expect(t.max()).toBeNull();
    });
  });

});
