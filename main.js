Vue.createApp({
  data() {
    return {
      selected: null,
      memory: Array(100).fill(0),
      isPlaying: false,
      executionSpeed: 150,
      calculator: 0,
      instructions: '',
      instructionPointer: 0,
      intervalHandle: undefined,
      output: [],
      logs: ['Running v0.1.0'],
      stopLogging: false,
      handlers: {
        9: (data) => {
          if (data == '01') {
            const input = parseInt(prompt('Enter Input: ', ''));
            this.calculator = input;
            this.log('Received input from user: ' + input);
          } else if (data == '02') {
            this.log('Outputting value of calculator: ' + this.calculator);
            this.out(this.calculator);
          }
        }, // in and out
        1: (data) => {
          this.log(`Adding value at address ${data} (${this.memory[data]}) to calculator.`);
          this.calculator += parseInt(this.memory[data]);
        }, // add
        2: (data) => {
          this.log(`Subtracting value at address ${data} (${this.memory[data]}) from calculator.`);
          this.calculator -= parseInt(this.memory[data]);
        }, // sub
        3: (data) => {
          this.log(`Storing value at calculator (${this.calculator}) in address ${data}.`);

          const copiedMemory = this.memory.slice(0);
          copiedMemory[data] = this.calculator;
          this.memory = copiedMemory;
        }, // store
        5: (data) => {
          this.log(`Loading value at address ${data} (${this.memory[parseInt(data)]}) into calculator.`);
          this.calculator = parseInt(this.memory[data]);
        }, // load
        6: (data) => {
          this.log('Jumping to address ' + data + '.');
          this.instructionPointer = parseInt(data);
        }, // branch always
        7: (data) => {
          if (this.calculator == 0) {
            this.log(`Jumping to address ${data} because calculator is 0`);
            this.instructionPointer = parseInt(data);
          } else {
            this.log(`Not jumping to address ${data} because calculator is not equal 0 (${this.calculator}).`);
          }
        }, // branch if zero
        8: (data) => {
          if (this.calculator >= 0) {
            this.log(
              `Jumping to address ${data} because calculator is greater than or equal to 0 (${this.calculator}).`
            );
            this.instructionPointer = parseInt(data);
          } else {
            this.log(
              `Not jumping to address ${data} because calculator is not greater than or equal to 0 (${this.calculator})`
            );
          }
        }, // branch if positive or zero
        0: (_) => {
          this.log('Halting.');
          this.stop();
        }, // halt
      },
    };
  },
  watch: {
    selected(newVal, _) {
      switch (newVal) {
        case '1':
          this.instructions = '901\n320\n901\n321\n901\n120\n121\n902';
          break;
        case '2':
          this.instructions = '901\n320\n120\n320\n901\n321\n121\n121\n902';
          break;
        case '3':
          this.instructions = '901\n320\n901\n321\n220\n807\n520\n902\n000\n521\n902';
          break;
        case '4':
          this.instructions =
            '901\n320 ; get input and store in address 20\n901\n321 ; ... in address 21\n901\n322 ; ... in address 22\n120 ; add value at address 20 to calculator\n322 ; store value of calculator in address 22\n902 ; output value of calculator\n221 ; subtract value of calculator with value at address 21\n713 ; branch to address 13 if calculator is zero\n522 ; store value of calculator in address 22\n606 ; branch to address 6';
          break;

        default:
          break;
      }
    },
    logs: {
      handler(_, __) {
        this.$refs.logs.scrollTop = this.$refs.logs.scrollHeight;
      },
      deep: true,
      flush: 'post',
    },
    output: {
      handler(_, __) {
        this.$refs.output.scrollTop = this.$refs.output.scrollHeight;
      },
      deep: true,
      flush: 'post',
    },
    memory: {
      handler(newVal, oldVal) {
        const changeList = [];
        // put index of changes into changeList
        for (let i = 0; i < newVal.length; i++) {
          if (newVal[i] !== oldVal[i]) {
            changeList.push(i);
          }
        }

        changeList.forEach((index) => {
          this.$refs['memoryCell'][index].classList.add('animate-flash');
          setTimeout(() => {
            this.$refs['memoryCell'][index].classList.remove('animate-flash');
          }, 250);
        });
      },
      deep: true,
      flush: 'post',
    },
  },
  methods: {
    init() {
      this.memory = Array(100).fill(0);
      this.isPlaying = false;
      this.executionSpeed = 500;
      this.calculator = 0;
      this.instructions = '';
      this.instructionPointer = 0;
      this.intervalHandle = undefined;
      this.output = [];
      this.logs = ['Running v0.1.0'];
    },
    log(string) {
      if (this.stopLogging) return;
      this.logs.push(`<${this.instructionPointer.toString().padStart(2, '0')}> ${string}`);
    },
    out(string) {
      this.output.push(string);
    },
    removeComments(line) {
      const commentSymbol = ';';
      const commentRegex = new RegExp(`${commentSymbol}.*$`, 'g');

      return line.replace(commentRegex, '').trim();
    },
    clearMemory() {
      this.memory = Array(100).fill(0);
    },
    parseInstructions() {
      this.clearMemory();
      const instructions = this.instructions.split('\n').filter((e) => e);
      instructions.forEach((instruction, index) => {
        this.memory[index] = this.removeComments(instruction);
      });
    },
    step() {
      const opCode = this.memory[this.instructionPointer].toString()[0];
      const data = this.memory[this.instructionPointer].toString().substring(1, 3);

      this.instructionPointer++;

      this.handlers[opCode](data);
    },
    play() {
      this.isPlaying = true;
      if (this.intervalHandle == undefined) {
        this.intervalHandle = setInterval(() => {
          if (!this.isPlaying) return;

          this.step();
        }, this.executionSpeed);
      }
    },
    pause() {
      this.isPlaying = false;
    },
    nextStep() {
      if (this.intervalHandle != undefined) {
        this.intervalHandle = clearInterval(this.intervalHandle);
        this.isPlaying = false;
      }
      this.step();
    },
    stop() {
      this.isPlaying = false;
      this.calculator = 0;
      this.instructionPointer = 0;
      this.intervalHandle = clearInterval(this.intervalHandle);
    },
  },
  mounted() {},
}).mount('#app');
