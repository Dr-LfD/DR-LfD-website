主要问题是 **06 段误述画面、25 段误述重训范围、24 段加入未经支持的失败顺序，以及 00/01 段超时**。以下索引按 `narration.json` 从 00 起算；主要分段边界经原视频抽帧确认合理。

1. **06｜86.5–103.5s：把机器人执行画面提前说成遥操作失败。**

   原文：“Some placements cannot be demonstrated at all. Here, the operator fails to teleoperate the robot to a far object. As a result…”

   86.5–94.2s 主要展示机器人执行；右侧操作员约在 94.2s 才出现。“cannot … at all”和“far object”也超出了证据：论文说硬件和人体运动范围限制示范多样性，未证明这些位置绝对无法示范。证据：[前半段画面](/tmp/supvid/kf/07_86.5-94.2.jpg)、[操作员画面](/tmp/supvid/kf/08_94.2-103.5.jpg)、[Introduction L9](/home/user/yzchen_ws/LfD-TAMP-TRO-response/sec_I_introduction.tex:9)。

   替换：
   > On the left, the robot performs the task. On the right, the operator struggles to reproduce that motion with the teleoperation setup.

   约 **10s / 16.4s**。两句分别从约 **86.8s、94.5s** 开始，保留中间停顿。

2. **25｜309.2–320.7s：实验重训了每个技能，并非仅重训薄弱技能。**

   原文：“we retrain only the weak ones… success in clutter rises from zero to fifty-five percent.”

   论文明确写的是 **each skill**；0→55% 特指 **四个干扰物下的完整 Cup-Sponge-Screwdriver 任务**。数字正确，实验范围需要说清。证据：[实验 L384–387](/home/user/yzchen_ws/LfD-TAMP-TRO-response/sec_VI_experiments.tex:384)。

   替换：
   > Retraining each skill with five extra demonstrations raises full-task success with four distractors from zero to fifty-five percent.

   约 **9.2s / 10.9s**。

3. **24｜299.5–309.2s：“fails first”把瓶颈判断变成了时间顺序结论。**

   原文：“with new objects, the learned visuomotor policy fails first.”

   论文支持的是：同类物体换成新实例后，主要瓶颈仍在策略执行阶段，可能停滞或偏离示范；未证明它总是首先失败。“visuomotor policy”首次听到也不够直观。证据：[实验 L388–389](/home/user/yzchen_ws/LfD-TAMP-TRO-response/sec_VI_experiments.tex:388)。

   替换：
   > With new versions of familiar objects, the controller that turns camera images into robot actions remains the bottleneck.

   约 **8.3s / 9.1s**。

4. **00、01：已有实测超时，应缩短文本。**

   证据：[fit.txt L1–2](/tmp/supvid/fit.txt:1)。按 0.3s 起始留白计算，00 段会念到 **5.20s**，跨过 5.10s 转场；01 段只剩约 **0.02s** 尾部留白。

   | 段 | 原文 | 实测／预算 | 替换句 |
   |---|---|---|---|
   | 00 | “DR-LfD: planning with skills learned from demonstrations.” | 4.90／4.50s | “DR-LfD combines learning and planning.” |
   | 01 | “Imitation learning generalizes poorly; planning struggles with contact.” | 4.58／4.30s | “Imitation struggles to generalize. Planning struggles with contact.” |

   替换句约 **3.8s、3.3s**。建议局部缩短；全局加速会进一步增加后面长片段的静音。

5. **26｜320.7–336.7s：失败类型念得早于对应画面出现。**

   原文：“Typical failures include unexpected object dynamics, inaccurate grasps, policy failures, and hardware failures.”

   整句实测仅 7.68s，约 **328.7s** 已念完；硬件失败画面到约 **332s** 才出现。随后又留下约 8s 静音。类别本身正确。证据：原视频 **320.7、326、329、332s** 抽帧及 `/tmp/supvid/sheet/s04.jpg`。

   替换并按画面分句配音：
   > Unexpected object motion can disrupt execution.  
   > Grasps can miss the object.  
   > Learned skills can fail.  
   > Hardware can fail too.

   四句分别约从 **321、325、328、332s** 开始；总语音约 **7.9s**，连同停顿可放入原片段。

6. **23｜284.8–299.5s：“contact detector”未解释，且“finds the failed step”过于宽泛。**

   原文：“A contact detector finds the failed step…”

   实际检测的是预期的夹爪—物体接触是否建立，本段对应被移动物体导致的漏抓，并非任意步骤故障诊断。证据：[方法 L251](/home/user/yzchen_ws/LfD-TAMP-TRO-response/sec_V_plan_composition.tex:251)、[扰动实验 L375](/home/user/yzchen_ws/LfD-TAMP-TRO-response/sec_VI_experiments.tex:375)。

   替换整段：
   > A person moves each target before grasping. Wrist-camera images reveal the missed grasp, so the system observes the scene again and replans.

   约 **10.4s / 14.1s**。

7. **20｜224.5–251.5s：ACT 含义未交代，尾部静音约 12.4s。**

   原文：“one part… the other arm… Diffusion policy and ACT fail…”

   动作描述和基线失败结论正确，但可直接说清哪个物体、哪只手臂；ACT 的字母读音已有映射，听众仍不知道它是什么。这里补充实测成功率也有助于理解画面。证据：[实验 L177、190–191](/home/user/yzchen_ws/LfD-TAMP-TRO-response/sec_VI_experiments.tex:177)。

   替换：
   > The socket starts beyond the left arm's reach. The right arm moves it to the middle of the table, where the left arm can grasp it for insertion. DR-LfD succeeds in fifty-five percent of these trials. The imitation baselines fail in every trial.

   约 **21.7s / 26.4s**。

8. **21｜251.5–272.5s：可补充结果，改善约 11.4s 的尾部静音。**

   原文：“The planner detects the possible collision, moves the pole away first, and then inserts the peg.”

   内容正确。补上 **70%** 能帮助观众区分成功示例与总体表现。证据：[实验 L178、192](/home/user/yzchen_ws/LfD-TAMP-TRO-response/sec_VI_experiments.tex:178)。

   可选替换：
   > A pole blocks the insertion motion. The planner checks for collisions, moves the pole aside, and then runs the insertion skill. DR-LfD succeeds in seventy percent of these trials.

   约 **15.4s / 20.4s**。

9. **03｜32.8–57.9s：“both tasks”听觉指代不清。**

   原文：“The user asks to finish both tasks…”

   前一句刚列举三个技能，听众容易疑惑“both”指哪两个。屏幕明确指杯子擦拭和螺丝刀装盒；19 步正确。证据：[本段画面](/tmp/supvid/kf/03_32.8-57.9.jpg)、[实验 L223、229](/home/user/yzchen_ws/LfD-TAMP-TRO-response/sec_VI_experiments.tex:223)。

   仅替换该句：
   > The goal is to wipe the cup, pack the screwdriver, and leave every object on the table.

   替换后整段约 **21s / 24.5s**。

其余段落：

- **02**：胶带交接复用和计划投篮均有依据，画面一致。
- **04**：可达性与避碰约束描述正确。
- **05**：泛化问题及示范采集范围受限均有论文依据。
- **07**：实验汇总过渡正确，时长合适。
- **08**：Franka 示范描述正确。
- **09**：Franka 新位置、新朝向与成功示例一致；未套用 ALOHA 统计，OOD 已通过上下文解释。
- **10**：ALOHA 螺丝刀示范描述正确。
- **11**：80% 对 10% 与表 `tab:real_ood` L96–98 一致。
- **12**：Leaky 已立即解释为倾斜支撑摆放，描述正确。
- **13**：交接示范介绍正确。
- **14**：右臂交给左臂正确；19/20 对 6/20 与表 L86–88 一致。
- **15**：倾靠支撑物及 20/20 与表 L89–91 一致。
- **16**：杯套插入名称及画面一致。
- **17**：倾斜摆放与插入困难描述正确；表 L109–111 为 35%、35%、40%。
- **18**：仿真及脚本示范来源与屏幕文字一致；当前预算仅余 0.10s，保持简短。
- **19**：抓取后执行学得的插入技能，描述正确；约 8s 静音可供观看多路动作。
- **22**：完整任务 OOD 下 50% 对 0%，与表 L116–118 一致。
- **27**：网站引导与结束画面一致。

TTS 文本层面，`synth.py:15` 已覆盖 DR-LfD、OOD、ACT 和 ALOHA；数字均已写成英文单词，未发现其他明确的读音问题。替换句时长按约 2.4 词/秒估算，并计入 DR-LfD 的五字母展开；尚未重新合成，最终需用原声线复测修改段，确认不超过各段预算。

**总体结论：主要统计数字正确；修正三处实质表述、两处超时和两处画面内对齐后，可进入最终配音。**