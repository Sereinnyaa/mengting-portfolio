import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowUpRight, FileDown, Github, Mail } from 'lucide-react'

const projects = [
  {
    id: '01',
    company: '阿里国际',
    title: '供应链答疑 Agent',
    role: 'AI 产品 · Agent · 评测体系',
    summary: '将分散的供应链知识、工具调用与业务规则组织成可验证的答疑链路，让回答不仅“能答”，更能被业务信任、定位和持续优化。',
    metrics: [['91%', '回答准确率'], ['65 → 82', '用户满意度'], ['+35pp', '质量提升']],
    visual: 'agent',
  },
  {
    id: '02',
    company: '阿里国际',
    title: '履约体验决策大脑',
    role: 'AI 产品 · 决策支持 · 策略闭环',
    summary: '围绕物流履约体验，将需求感知、方案决策、异常归因与治理闭环串成一套可执行的智能决策流程。',
    metrics: [['买得到', '个性化方案'], ['送得到', '异常主动治理'], ['服务好', '体验持续优化']],
    visual: 'fulfillment',
  },
  {
    id: '03',
    company: '焦点科技',
    title: 'AI 洽谈助手',
    role: 'AI 产品 · 跨境 B2B · 快速原型',
    summary: '面向跨境 B2B 洽谈场景，在对话发生的当下理解商品与供应商语境，生成更贴近业务的沟通建议并支持快速验证。',
    metrics: [['理解', '商品与供应商语境'], ['辅助', '实时沟通决策'], ['迭代', '反馈驱动优化']],
    visual: 'focus',
  },
  {
    id: '04',
    company: '个人项目',
    title: 'TripSage',
    role: '旅行 Agent · RAG · 工具调用',
    summary: '一个能够规划完整行程、查询实时交通方案，并从个人差旅知识库中回答政策问题的旅行 Agent。',
    metrics: [['规划', '完整差旅行程'], ['查询', '实时交通方案'], ['检索', '差旅政策知识']],
    visual: 'tripsage',
    link: 'https://tripsage.tripsage-cloudflare-demo.workers.dev/',
    linkLabel: '访问 TripSage',
  },
  {
    id: '05',
    company: '个人项目',
    title: 'AutoDeck',
    role: 'PPT Agent · 内容规划 · 自动生成',
    summary: '从一个主题或源文件出发，自动组织演示叙事、规划页面结构，并生成一套可继续编辑的完整幻灯片。',
    metrics: [['输入', '主题或文件'], ['规划', '演示叙事结构'], ['输出', '可编辑幻灯片']],
    visual: 'autodeck',
    link: 'https://github.com/Sereinnyaa/AutoDeck',
    linkLabel: '查看 AutoDeck 源码',
  },
]

const expertise = [
  ['01', 'AI Agent 产品', '从真实任务出发设计 Agent 循环、工具边界、异常兜底与必要的人机协作。'],
  ['02', 'RAG 与评测', '搭建知识结构、检索链路与评测集，让模型表现从“凭感觉”变成可以定位和迭代的数据。'],
  ['03', '产品策略', '识别最值得解决的切入点，在业务约束与用户价值之间形成清晰、可落地的产品方向。'],
  ['04', '快速原型', '尽早把 AI 行为做成可体验的原型，用真实反馈验证需求、交互和模型能力边界。'],
  ['05', '数据驱动迭代', '结合用户反馈、业务指标与模型评测，让产品从一次惊艳演示走向稳定可用。'],
]

const traits = [
  ['好奇心强', '对没弄明白的事情，总想再往下追一层。'],
  ['目标导向', '比起“做了什么”，更习惯先想清楚“要解决什么”。'],
  ['沉稳细心', '对数据、逻辑和体验里的小问题比较敏感。'],
  ['复盘迭代', '做完不是结束，会回头看看哪里还能更好。'],
]

const galleryRows = [
  [
    ['assets/focus-assistant.webp', '焦点科技 AI 洽谈助手'],
    ['assets/qa-office.webp', '阿里国际办公经历'],
    ['assets/tripsage-home.webp', 'TripSage 首页'],
    ['assets/autodeck-output.webp', 'AutoDeck 生成结果'],
    ['assets/fulfillment-life.webp', '阿里国际团队活动'],
  ],
  [
    ['assets/qa-evaluation.webp', '答疑 Agent 评测归因体系'],
    ['assets/fulfillment-brain.webp', '履约体验决策大脑'],
    ['assets/tripsage-results.webp', 'TripSage 实时方案'],
    ['assets/focus-life-v2.webp', '焦点科技经历'],
    ['assets/autodeck-input.webp', 'AutoDeck 输入界面'],
  ],
]

function Fade({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.14 }} transition={{ duration: .7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function MagneticAvatar() {
  const [pose, setPose] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 })

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') {
        setPose({ x: 0, y: 0, rotateX: 0, rotateY: 0 })
        return
      }

      const px = event.clientX / window.innerWidth
      const py = event.clientY / window.innerHeight
      const horizontalProgress = Math.max(-1, Math.min(1, (px - .5) * 2))
      const downwardProgress = Math.max(0, Math.min(1, (py - .2) / .8))

      setPose({
        x: horizontalProgress * 4,
        y: downwardProgress * 28,
        rotateX: (.5 - py) * 1.6,
        rotateY: horizontalProgress * 1.4,
      })
    }
    const onPointerLeave = () => setPose({ x: 0, y: 0, rotateX: 0, rotateY: 0 })
    window.addEventListener('pointermove', onPointerMove)
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <motion.div
      className="avatar-shell"
      animate={pose}
      transition={{ type: 'spring', stiffness: 78, damping: 24, mass: .82 }}
    >
      <div className="avatar-glow" />
      <div className="orbit orbit-a"><i /><i /><i /></div>
      <div className="orbit orbit-b"><i /><i /></div>
      <img src="assets/hero-avatar-rimless-glasses.webp" alt="喻梦婷佩戴无边框眼镜的 3D 头像" />
    </motion.div>
  )
}

function ImageShowcase() {
  const section = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] })
  const rowOneX = useTransform(scrollYProgress, [0, 1], ['-4%', '-24%'])
  const rowTwoX = useTransform(scrollYProgress, [0, 1], ['-24%', '-4%'])
  return (
    <section className="image-showcase" ref={section} aria-label="项目与经历图片展示">
      {galleryRows.map((row, rowIndex) => (
        <motion.div className="showcase-row" style={{ x: rowIndex === 0 ? rowOneX : rowTwoX }} key={rowIndex}>
          {[...row, ...row].map(([src, alt], index) => (
            <figure key={`${src}-${index}`}>
              <img src={src} alt={alt} />
              <figcaption>{alt}</figcaption>
            </figure>
          ))}
        </motion.div>
      ))}
    </section>
  )
}

function MediaTile({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return <figure className={className}><img src={src} alt={alt} /><figcaption>{alt}</figcaption></figure>
}

function ProjectVisual({ type }: { type: string }) {
  if (type === 'agent') return <div className="project-media project-media-pair"><MediaTile className="media-photo" src="assets/qa-office.webp" alt="阿里国际经历" /><MediaTile className="media-screen" src="assets/qa-evaluation.webp" alt="答疑 Agent 评测归因体系" /></div>
  if (type === 'fulfillment') return <div className="project-media project-media-pair"><MediaTile className="media-photo" src="assets/fulfillment-life.webp" alt="阿里国际团队活动" /><MediaTile className="media-screen" src="assets/fulfillment-brain.webp" alt="履约体验决策大脑" /></div>
  if (type === 'focus') return <div className="project-media project-media-pair"><MediaTile className="media-photo" src="assets/focus-life-v2.webp" alt="焦点科技经历" /><MediaTile className="media-screen" src="assets/focus-assistant.webp" alt="AI 洽谈助手产品界面" /></div>
  if (type === 'tripsage') return <div className="project-media project-media-three"><MediaTile className="media-screen" src="assets/tripsage-home.webp" alt="TripSage 首页" /><MediaTile className="media-screen" src="assets/tripsage-knowledge.webp" alt="个人差旅知识空间" /><MediaTile className="media-screen" src="assets/tripsage-results.webp" alt="实时差旅方案查询" /></div>
  return <div className="project-media project-media-pair"><MediaTile className="media-screen" src="assets/autodeck-input.webp" alt="AutoDeck 主题输入" /><MediaTile className="media-screen" src="assets/autodeck-output.webp" alt="AutoDeck 幻灯片输出" /></div>
}

function ProjectCard({ project, index }: { project: typeof projects[number]; index: number }) {
  const slot = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: slot, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, .34, .72, 1], [.965, 1, 1, .97])
  return (
    <div className="project-slot" ref={slot}>
      <motion.article style={{ scale, zIndex: index + 1 }} className="project-card">
        <header>
          <span className="project-number">{project.id}</span>
          <div className="project-title-block">
            <p>{project.company}</p><h3>{project.title}</h3><small>{project.role}</small>
            {project.link && <a className="project-link" href={project.link} target="_blank" rel="noreferrer">{project.linkLabel}<ArrowUpRight /></a>}
          </div>
        </header>
        <div className="project-body">
          <div className="project-copy">
            <p>{project.summary}</p>
            <div className="metric-row">{project.metrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
          </div>
          <ProjectVisual type={project.visual} />
        </div>
      </motion.article>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      document.documentElement.style.setProperty('--mx', `${event.clientX}px`)
      document.documentElement.style.setProperty('--my', `${event.clientY}px`)
    }
    window.addEventListener('pointermove', onPointer)
    return () => window.removeEventListener('pointermove', onPointer)
  }, [])

  return (
    <main>
      <div className="cursor-glow" />
      <section className="hero" id="top">
        <nav>
          <a href="#about">ABOUT</a>
          <a href="#expertise">SKILLS</a>
          <a href="#projects">PROJECTS</a>
          <a href="#contact">CONTACTS</a>
        </nav>
        <motion.div className="hero-title" initial={{ opacity: 0, y: 52 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
          <h1>HI, I'M MENGTING</h1>
        </motion.div>
        <MagneticAvatar />
        <motion.div className="hero-bottom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8, delay: .75 }}>
          <div><b>AI PM</b><p>保持好奇，在有趣的事情上，<br />做长期有价值的事。</p></div>
        </motion.div>
        <a className="scroll-cue" href="#showcase"><ArrowDown size={17} /> 向下探索</a>
      </section>

      <div id="showcase"><ImageShowcase /></div>

      <section className="about" id="about">
        <div className="section-index">01 / 关于我</div>
        <Fade><h2>被好奇心驱动的<br /><em>AI 产品玩家</em></h2></Fade>
        <div className="player-profile">
          <Fade className="player-intro">
            <p className="profile-label">玩家档案 / PLAYER PROFILE</p>
            <h3>喻梦婷 <span>· LV.24</span></h3>
            <div className="main-quest">
              <small>当前主线</small>
              <strong>AI 产品经理</strong>
              <p>一个被好奇心推动前进的 AI 产品 er，既在意数据和逻辑，也在意审美和体验。</p>
            </div>
            <p className="player-background">现就读于东南大学电子信息硕士，本科毕业于中国海洋大学计算机科学与技术专业。在阿里国际、焦点科技和个人项目里，持续把问题拆清楚，再把想法做成可以体验和验证的产品。</p>
            <div className="edu-tags"><span>国家奖学金</span><span>CCF-B 一作</span><span>IELTS 7.5</span></div>
          </Fade>
          <Fade className="trait-panel" delay={.1}>
            <p className="profile-label">角色特质 / TRAITS</p>
            <div className="trait-grid">
              {traits.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}
              <article className="hidden-trait"><span>隐藏属性</span><h3>ENFJ</h3><p>仅供彩蛋，不作使用说明书。</p></article>
            </div>
          </Fade>
        </div>
      </section>

      <section className="expertise" id="expertise">
        <div className="section-index dark">02 / 能力</div>
        <Fade><h2>我在做什么</h2></Fade>
        <div className="expertise-list">
          {expertise.map(([n, title, description], i) => <Fade key={n} delay={i * .04} className="expertise-item"><span>{n}</span><h3>{title}</h3><p>{description}</p><ArrowUpRight /></Fade>)}
        </div>
      </section>

      <section className="projects" id="projects">
        <div className="section-index">03 / 代表项目</div>
        <Fade><div className="projects-heading"><h2>项目案例</h2><p>五个案例，记录我如何把企业 AI 与个人想法从问题推进到真实产品。</p></div></Fade>
        <div className="project-stack">{projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}</div>
      </section>

      <footer id="contact">
        <div className="section-index">04 / 联系我</div>
        <Fade><p className="availability"><i /> 正在寻找 AI 产品相关机会</p><h2>一起把有趣的事，<br />做成 <em className="value-word">长期有价值</em> 的产品</h2></Fade>
        <div className="footer-links">
          <a href="mailto:nyaaserein@163.com"><Mail /> 邮箱/nyaaserein@163.COM <ArrowUpRight /></a>
          <a href="https://github.com/Sereinnyaa" target="_blank" rel="noreferrer"><Github /> GITHUB / SEREINNYAA <ArrowUpRight /></a>
          <a href="resume/mengting-yu-ai-pm.pdf" download="喻梦婷_AI产品经理_简历.pdf"><FileDown /> 下载简历 / RESUME <ArrowUpRight /></a>
        </div>
        <div className="footer-bottom"><span>© 2026 喻梦婷</span><a href="#top">返回顶部 ↑</a><span>Stay Curious, Keep Building</span></div>
      </footer>
    </main>
  )
}
