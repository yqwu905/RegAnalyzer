<script lang="ts">
import { ref } from 'vue';

interface RegisterTemplate {
    name: string;
    template: string
}

export default {
    data() {
        return {
            selectedOption: '',
            inputText: '',
            displayText: '',
            regs: [] as Array<RegisterTemplate>, // 将从json文件加载的寄存器数据存储在这里
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
            }

        } catch (error) {
            console.error('加载寄存器文件失败:', error);
        }
    },
    methods: {
        parseJinjaTemplate(template: string) {
            try {
                // 提取模板中的变量
                const variables = template.match(/{{(.*?)}}/g)?.map(v => v.slice(2, -2).trim());
                if (!variables) {
                    return { error: true, message: '模板中没有变量', position: 0 };
                }

                // 将模板转换为正则表达式
                const regexStr = template.replace(/{{.*?}}/g, '(.+?)');
                const regex = new RegExp('^' + regexStr + '$');

                // 尝试匹配输入文本
                const match = this.inputText.match(regex);
                if (!match) {
                    return { error: true, message: '输入文本与模板不匹配', position: 0 };
                }

                // 构建结果对象
                const result: { [id: string]: string } = {};
                variables.forEach((variable, index) => {
                    result[variable] = match[index + 1];
                });

                return result;
            } catch (error) {
                return { error: true, message: (error as Error).message, position: 0 };
            }
        },

        handleClick() {
            const selectedReg = this.regs.find(reg => reg.name === this.selectedOption);
            if (selectedReg) {
                const result = this.parseJinjaTemplate(selectedReg.template);
                if (!result.error) {
                    this.displayText = JSON.stringify(result, null, 2);
                } else {
                    this.displayText = `解析失败: ${result.message}\n在位置 ${result.position} 处匹配失败!`;
                }
            } else {
                this.displayText = '请选择寄存器模板!';
            }
        }
    }
}
</script>

<template>
    <div class="container">
        <div class="top">
            <select v-model="selectedOption" class="select">
                <option value="">请选择寄存器模板</option>
                <option v-for="reg in regs" :value="reg.name">{{ reg.name }}</option>
            </select>
            <button class="button" @click="handleClick">解析</button>
        </div>

        <div class="middle">
            <textarea v-model="inputText" class="input-area" placeholder="请输入寄存器数据">
            </textarea>
        </div>

        <div style="margin: 10px"></div>

        <div class="bottom">
            <div class="display-area">
                {{ displayText }}
            </div>
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

.display-area {
    width: 33.33%;
    min-height: 100px;
    padding: 10px;
    border: 1px solid #ccc;
}
</style>
