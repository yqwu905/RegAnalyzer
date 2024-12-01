<script lang="ts">
import { ref } from 'vue';

interface RegisterField {
    name: string,
    low_bit: number,
    high_bit: number,
    desc: string,
    default: number
}

interface RegisterTemplate {
    name: string;
    template: string,
    registers: { [id: string]: Array<RegisterField> }
}

interface TreeNode {
    key?: string | number;           // 唯一标识
    label: string;                   // 节点显示的标签
    data?: any;                      // 节点关联的数据
    icon?: string;                   // 节点图标
    children?: TreeNode[];           // 子节点数组
    selectable?: boolean;            // 是否可选
    style?: string | object;         // 样式
    styleClass?: string;             // 样式类
    expanded?: boolean;              // 是否展开
    type?: string;                   // 节点类型
    leaf?: boolean;                  // 是否为叶子节点
}

export default {
    data() {
        return {
            selectedOption: '',
            inputText: '',
            displayText: '',
            regs: [] as Array<RegisterTemplate>, // 将从json文件加载的寄存器数据存储在这里
            regsList: [] as Array<string>,
            parsedRegTree: [] as Array<TreeNode>
        }
    },
    async created() {
        try {
            // 使用 import.meta.glob 动态导入所有json文件
            const jsonFiles = import.meta.glob<{ default: RegisterTemplate }>('/src/registers/*.json');
            console.log(jsonFiles);
            // 遍历并加载所有json文件
            for (const path in jsonFiles) {
                const module = await jsonFiles[path]() as { default: RegisterTemplate };
                this.regs.push(module.default);
                this.regsList.push(module.default.name);
            }

        } catch (error) {
            console.error('加载寄存器文件失败:', error);
        }
    },
    methods: {
        getBits(num: number, low_bit: number, high_bit: number): number {
            // 创建掩码
            const mask = ((1 << (high_bit - low_bit + 1)) - 1) << low_bit;
            // 提取位并右移
            return (num & mask) >> low_bit;
        },

        parseJinjaTemplate(template: string): { [id: string]: string } | null {
            // 提取模板中的变量
            const variables = template.match(/{{(.*?)}}/g)?.map(v => v.slice(2, -2).trim());
            if (!variables) {
                this.$toast.add({severity: 'error', summary: 'Error', detail: '非法的DownInfo模板!', life: 1000});
                return null
            }

            // 将模板转换为正则表达式
            const regexStr = template.replace(/{{.*?}}/g, '(.+?)');
            const regex = new RegExp('^' + regexStr + '$');

            // 尝试匹配输入文本
            const match = this.inputText.match(regex);
            if (!match) {
                this.$toast.add({severity: 'error', summary: 'Error', detail: '输入文本与模板不匹配', life: 1000});
                return null
            }

            // 构建结果对象
            const result: { [id: string]: string } = {};
            variables.forEach((variable, index) => {
                result[variable] = match[index + 1];
            });

            return result;
        },

        handleClick() {
            this.parsedRegTree = []
            const selectedReg = this.regs.find(reg => reg.name === this.selectedOption);
            let count = 0;
            if (selectedReg) {
                const result = this.parseJinjaTemplate(selectedReg.template);
                if (result !== null) {
                    for (const key in result) {
                        const regVal = parseInt(result[key], 0)
                        if (isNaN(regVal)) {
                            this.$toast.add({severity: 'error', summary: 'Error', detail: `${result[key]}为非法的寄存器值!`, life: 1000});
                        } else {
                            count++;
                            let child_count = 0;
                            let fields = selectedReg.registers[key]
                            let node: TreeNode = { key: count, label: `${key}: ${regVal}`, data: regVal, children: [] };
                            for (const field of fields) {
                                node.children!.push({
                                    key: `${count}-${child_count}`,
                                    label: `${field.name}: ${this.getBits(regVal, field.low_bit, field.high_bit)}`, 
                                    children: [{ label: field.desc }, {label: `default value: ${field.default}`}] 
                                })
                                child_count++;
                            }
                            this.parsedRegTree.push(node)
                        }
                    }
                    this.$toast.add({severity: 'info', summary: 'Info', detail: '解析完成!', life: 1000});
                }
            } else {
                this.$toast.add({severity: 'error', summary: 'Error', detail: '请选择寄存器模板!', life: 1000});
            }
        }
    }
}
</script>

<template>
    <Toast />
    <div class="container">
        <div class="top">
            <p>DownInfo模板</p>
            <Select v-model="selectedOption" :options='regsList' />
            <Button @click="handleClick" label="submit" raised />
        </div>

        <div class="middle">
            <textarea v-model="inputText" class="input-area" placeholder="请输入寄存器数据">
            </textarea>
        </div>

        <div style="margin: 10px"></div>

        <div class="bottom">
            <Tree :value=parsedRegTree />
        </div>
    </div>
</template>


<style scoped>
.container {
    min-height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
}

.top {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
}

.select {
    padding: 8px;
}

.button {
    padding: 8px 16px;
}

.middle {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 25vh;
}

.input-area {
    width: 33.33%;
    height: 100%;
    padding: 10px;
    resize: none;
}

.bottom {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 25vh;
}
</style>
