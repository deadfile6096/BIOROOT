class Organism {
    constructor(dna) {
      this.dna = dna;
  
      // Determine a strength to organism to calculate lifetime
      const strength = this.dna / Organism.DNA_MAX_VALUE;
  
      this.age = 0;
      this.lifetime = 16 + Math.floor(strength * 16);
      this.style = Organism.createColorFromDna(this.dna);
    }
  
    isAlive() {
      return this.age <= this.lifetime;
    }
  
    isReadyForOffspring() {
      return Math.random() < Organism.OFFSPRING_RATE;
    }
  
    isSameSpecies(organism) {
      return Organism.isSameSpecies(this, organism);
    }
  
    update() {
      ++this.age;
    }
  
    render(context) {
      context.fillStyle = this.style;
      context.fillRect(0, 0, 1, 1);
    }
  
    clone() {
      return new Organism(this.dna);
    }
  
    static getDnaValue(dna) {
      return (dna.toString(2).match(/1/g) || []).length;
    }
  
    static getDnaString(dna) {
      let dnaString = dna.toString(2);
  
      while (dnaString.length < Organism.DNA_LENGTH) {
        dnaString = '0' + dnaString;
      }
  
      return dnaString;
    }
  
    static isSameSpecies(a, b) {
      const dnaValueA = Organism.getDnaValue(a.dna);
      const dnaValueB = Organism.getDnaValue(b.dna);
  
      return Math.abs(dnaValueA - dnaValueB) < Organism.SIMILARITY_THRESHOLD;
    }
  
    static createRandom() {
      const dna = Math.floor(Math.random() * Organism.DNA_MAX_VALUE);
      return new Organism(dna);
    }
  
    static createFromParents(a, b) {
      const dnaStringA = Organism.getDnaString(a.dna);
      const dnaStringB = Organism.getDnaString(b.dna);
      let dnaString = '';
  
      for (let i = 0; i < Organism.DNA_LENGTH; i++) {
        dnaString += Math.random() < .5 ? dnaStringA[i] : dnaStringB[i];
      }
  
      if (Math.random() < Organism.MUTATION_RATE) {
        const mutationIndex = Math.floor(Math.random() * Organism.DNA_LENGTH);
        const mutationGene = 1 - parseInt(dnaString[mutationIndex]);
        const preMutationDnaString = dnaString.substr(0, mutationIndex);
        const postMutationDnaString = dnaString.substr(mutationIndex + 1);
  
        dnaString = `${preMutationDnaString}${mutationGene}${postMutationDnaString}`;
      }
  
      return new Organism(Number.parseInt(dnaString, 2));
    }
  
    static createColorFromDna(dna) {
      const hue = Math.floor(Organism.getDnaValue(dna) / Organism.DNA_LENGTH * 360);
      return `hsl(${hue}, 50%, 55%)`;
    }}
  
  
  Organism.DNA_LENGTH = 16;
  Organism.DNA_MAX_VALUE = Math.pow(2, Organism.DNA_LENGTH);
  Organism.MUTATION_RATE = 1 / 100;
  Organism.OFFSPRING_RATE = 1 / 2;
  Organism.SIMILARITY_THRESHOLD = 2;
  
  class Simulation {
    constructor(size) {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
    }
  
    setSize(size) {
      this.size = size;
      this.canvas.height = this.size;
      this.canvas.width = this.size;
    }
  
    getOrganismIndexAt(x, y) {
      if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
        return -1;
      }
  
      return y * this.size + x;
    }
  
    getOrganismAtPosition(x, y) {
      const index = this.getOrganismIndexAt(x, y);
      return this.getOrganismAtIndex(index);
    }
  
    getOrganismAtIndex(index) {
      return this.organisms[index];
    }
  
    getOrganismPosition(index) {
      return {
        x: index % this.size,
        y: Math.floor(index / this.size) };
  
    }
  
    getNearParentIndex(index, otherParentIndex = undefined) {
      const position = this.getOrganismPosition(index);
  
      return [
      this.getOrganismIndexAt(position.x, position.y - 1),
      this.getOrganismIndexAt(position.x + 1, position.y),
      this.getOrganismIndexAt(position.x, position.y + 1),
      this.getOrganismIndexAt(position.x - 1, position.y)].
      filter(this.isValidParent.bind(this, otherParentIndex));
    }
  
    getNearParentsIndex(index, otherParentIndex = undefined) {
      const nearOrganisms = this.getNearParentIndex(index, otherParentIndex);
      const nearOrganismIndex = Math.floor(Math.random() * nearOrganisms.length);
  
      return nearOrganisms[nearOrganismIndex];
    }
  
    isOrganismAtIndex(index) {
      if (index < 0 || index >= this.organisms.length) {
        return false;
      }
  
      return this.isOrganism(this.getOrganismAtIndex(index));
    }
  
    isOrganism(organism) {
      return organism !== Simulation.ORGANISM_PADDING;
    }
  
    isValidParent(otherParentIndex, organismIndex) {
      const organism = this.getOrganismAtIndex(organismIndex);
      const otherParent = this.getOrganismAtIndex(otherParentIndex);
  
      return (
        this.isOrganismAtIndex(organismIndex) &&
        organism.isReadyForOffspring() && (
        otherParent === undefined || organism.isSameSpecies(otherParent)));
  
    }
  
    start() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.organisms = new Array(this.size * this.size).fill(Simulation.ORGANISM_PADDING);
  
      this.clearNewOrganisms();
      this.spawnOrganisms();
    }
  
    clearNewOrganisms() {
      this.newOrganisms = new Array(this.size * this.size);
    }
  
    flushNewOrganisms() {
      this.newOrganisms.forEach((organism, index) => {
        this.organisms[index] = organism;
      });
  
      this.clearNewOrganisms();
    }
  
    spawnOrganisms() {
      const center = Math.round(this.size / 2);
      const index = this.getOrganismIndexAt(center, center);
      const organism = Organism.createRandom();
  
      this.newOrganisms[index] = organism;
      this.newOrganisms[index - 1] = organism.clone();
    }
  
    update() {
      this.organisms.forEach((organism, index) => {
        if (this.isOrganism(organism) && !organism.isAlive()) {
          this.organisms[index] = Simulation.ORGANISM_PADDING;
          organism = Simulation.ORGANISM_PADDING;
        }
  
        if (!this.isOrganism(organism)) {
          const parentIndex1 = this.getNearParentsIndex(index);
  
          if (parentIndex1) {
            const parentIndex2 = this.getNearParentsIndex(parentIndex1, parentIndex1);
  
            if (parentIndex2) {
              const newOrganism = Organism.createFromParents(
              this.getOrganismAtIndex(parentIndex1),
              this.getOrganismAtIndex(parentIndex2));
  
  
              this.newOrganisms[index] = newOrganism;
              organism = newOrganism;
            }
          }
        }
  
        if (this.isOrganism(organism)) {
          organism.update();
        }
      });
    }
  
    render() {
      this.newOrganisms.forEach((organism, index) => {
        this.context.save();
  
        const position = this.getOrganismPosition(index);
        this.context.translate(position.x, position.y);
  
        organism.render(this.context);
  
        this.context.restore();
      });
  
      this.flushNewOrganisms();
    }
  
    loop() {
      requestAnimationFrame(this.loop.bind(this));
      sim.update();
      sim.render();
    }}
  
  
  Simulation.ORGANISM_PADDING = null;
  
  const sim = new Simulation();
  sim.setSize(128);
  sim.start();
  
  sim.render();
  sim.loop();
  
  document.getElementById('evolution-container').appendChild(sim.canvas);
  
  const controls = {
    size: sim.size,
    mutationRate: Organism.MUTATION_RATE,
    offspringRate: Organism.OFFSPRING_RATE,
    similarityThreshold: Organism.SIMILARITY_THRESHOLD,
  
    restart: () => {
      sim.start();
    },
  
    applyChanges: () => {
      sim.setSize(controls.size);
      Organism.MUTATION_RATE = controls.mutationRate;
      Organism.OFFSPRING_RATE = controls.offspringRate;
      Organism.SIMILARITY_THRESHOLD = controls.similarityThreshold;
  
      sim.start();
    } };
  
  
  const gui = new dat.GUI();
  
  gui.add(controls, 'size').
  min(16).step(16).max(256).
  onFinishChange(controls.applyChanges);
  gui.add(controls, 'offspringRate').
  min(0).step(1 / 10).max(1).
  onFinishChange(controls.applyChanges);
  gui.add(controls, 'mutationRate').
  min(0).step(1 / 100).max(.5).
  onFinishChange(controls.applyChanges);
  gui.add(controls, 'similarityThreshold').
  min(2).step(1).max(Organism.DNA_LENGTH).
  onFinishChange(controls.applyChanges);
  gui.add(controls, 'restart');